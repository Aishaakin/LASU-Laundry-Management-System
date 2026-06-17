"""
notifications/emails.py
Handles all transactional emails for LASU Viva Laundromat.

Email triggers:
  1. Welcome           — on user registration
  2. Password Reset    — on forgot password request
  3. Booking Request   — when user submits a booking (admin notified)
  4. Booking Confirmed — admin accepts the slot
  5. Booking Rejected  — admin rejects + suggests alternatives
  6. Items Received    — staff marks items as received at counter
  7. Clothes Ready     — staff marks order as ready for pickup
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

FROM_EMAIL   = settings.DEFAULT_FROM_EMAIL
SITE_NAME    = getattr(settings, 'SITE_NAME', 'LASU Viva Laundromat')
SITE_ADDRESS = getattr(settings, 'SITE_ADDRESS', 'LASU Main Campus, Lagos')
SUPPORT_EMAIL = getattr(settings, 'SUPPORT_EMAIL', 'help@lasuvivalaundromat.com.ng')


def _send(subject, html_content, recipient_email, text_content=None):
    """Send an HTML email with optional plain text fallback."""
    try:
        msg = EmailMultiAlternatives(
            subject=f'[{SITE_NAME}] {subject}',
            body=text_content or 'Please view this email in an HTML-capable client.',
            from_email=FROM_EMAIL,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send(fail_silently=False)
        logger.info(f'Email sent: "{subject}" → {recipient_email}')
        return True
    except Exception as e:
        logger.error(f'Email FAILED: "{subject}" → {recipient_email} | {e}')
        return False


def _html_wrapper(title, content_html, cta_label=None, cta_url=None):
    """Wrap content in a branded HTML template."""
    cta_block = ''
    if cta_label and cta_url:
        cta_block = f'''
        <div style="text-align:center;margin:32px 0;">
          <a href="{cta_url}" style="background:#1a5edb;color:#fff;padding:14px 32px;
             border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;
             display:inline-block;">{cta_label}</a>
        </div>'''
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1a5edb;border-radius:14px 14px 0 0;padding:28px 36px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🧺 {SITE_NAME}</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Lagos State University Campus</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#fff;padding:36px;border:1px solid #e2e8f5;">
          <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">{title}</h2>
          {content_html}
          {cta_block}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8faff;border:1px solid #e2e8f5;border-top:none;
            border-radius:0 0 14px 14px;padding:20px 36px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">{SITE_ADDRESS}</p>
          <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">
            Questions? <a href="mailto:{SUPPORT_EMAIL}" style="color:#1a5edb;">{SUPPORT_EMAIL}</a>
          </p>
          <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px;">© 2026 {SITE_NAME}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _booking_summary_html(booking):
    items_rows = ''.join(
        f'<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">{item.quantity}× {item.clothing_item_name}</td>'
        f'<td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;">₦{item.line_total}</td></tr>'
        for item in booking.items.all()
    )
    discount_row = (
        f'<tr><td style="padding:8px;color:#10b981;">Discount</td>'
        f'<td style="padding:8px;text-align:right;color:#10b981;">-₦{booking.discount}</td></tr>'
        if booking.discount > 0 else ''
    )
    return f"""
    <table width="100%" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr style="background:#eef6ff;">
        <th style="padding:10px;text-align:left;color:#1a5edb;">Item</th>
        <th style="padding:10px;text-align:right;color:#1a5edb;">Amount</th>
      </tr></thead>
      <tbody>
        {items_rows}
        <tr><td style="padding:8px;color:#64748b;">Service Fee</td>
            <td style="padding:8px;text-align:right;">₦{booking.service_fee}</td></tr>
        {discount_row}
        <tr style="background:#eef6ff;font-weight:700;">
          <td style="padding:10px;">TOTAL</td>
          <td style="padding:10px;text-align:right;color:#1a5edb;font-size:16px;">₦{booking.total_amount}</td>
        </tr>
      </tbody>
    </table>"""


# ── 1. Welcome ─────────────────────────────────────────────────────────────────
def send_welcome_email(user):
    html = _html_wrapper(
        f'Welcome, {user.first_name}! 🎉',
        f"""
        <p style="color:#475569;">Hi <strong>{user.first_name}</strong>,</p>
        <p style="color:#475569;">Welcome to <strong>{SITE_NAME}</strong>! Your account has been created successfully.</p>
        <p style="color:#475569;">You can now book laundry services online, track your orders, and pay with your Nigerian bank card or at our service counter.</p>
        <div style="background:#f0f9ff;border-left:4px solid #1a5edb;padding:14px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#0c4a6e;font-size:14px;">📍 <strong>Drop-off location:</strong> {SITE_ADDRESS}</p>
        </div>
        <p style="color:#94a3b8;font-size:13px;">If you did not create this account, please contact us immediately.</p>
        """,
        cta_label='Book Your First Wash',
        cta_url=f'{settings.FRONTEND_URL}/services'
    )
    _send(f'Welcome to {SITE_NAME}!', html, user.email)


# ── 2. Password Reset ──────────────────────────────────────────────────────────
def send_password_reset_email(user, reset_url):
    html = _html_wrapper(
        'Reset Your Password',
        f"""
        <p style="color:#475569;">Hi <strong>{user.first_name or user.email}</strong>,</p>
        <p style="color:#475569;">We received a request to reset the password for your LASU Viva account.</p>
        <p style="color:#475569;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:14px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;">⚠️ If you did not request this, you can safely ignore this email. Your password will not change.</p>
        </div>
        """,
        cta_label='Reset My Password',
        cta_url=reset_url
    )
    _send('Password Reset Request', html, user.email)


# ── 3. Booking Request (to admin) ──────────────────────────────────────────────
def send_booking_request_email(booking):
    """Notify admin staff that a new booking request has been submitted."""
    admin_emails = list(
        booking.user.__class__.objects.filter(is_staff=True).values_list('email', flat=True)
    )
    if not admin_emails:
        return

    html = _html_wrapper(
        f'New Booking Request: #{booking.order_number}',
        f"""
        <p style="color:#475569;">A new laundry booking has been submitted and is awaiting your review.</p>
        <table width="100%" style="font-size:14px;margin:16px 0;">
          <tr><td style="padding:6px;color:#64748b;">Customer:</td><td style="padding:6px;font-weight:600;">{booking.user_name}</td></tr>
          <tr><td style="padding:6px;color:#64748b;">Email:</td><td style="padding:6px;">{booking.user_email}</td></tr>
          <tr><td style="padding:6px;color:#64748b;">Phone:</td><td style="padding:6px;">{booking.user_phone or '—'}</td></tr>
          <tr><td style="padding:6px;color:#64748b;">Service:</td><td style="padding:6px;font-weight:600;">{booking.service_name}</td></tr>
          <tr><td style="padding:6px;color:#64748b;">Drop-off:</td><td style="padding:6px;font-weight:600;">{booking.scheduled_date} at {booking.scheduled_time}</td></tr>
          <tr><td style="padding:6px;color:#64748b;">Payment:</td><td style="padding:6px;">{booking.get_payment_method_display()}</td></tr>
        </table>
        {_booking_summary_html(booking)}
        <p style="color:#475569;">Please review and confirm or reject this booking from the admin dashboard.</p>
        """,
        cta_label='Review in Admin Dashboard',
        cta_url=f'{settings.FRONTEND_URL}/admin'
    )
    for email in admin_emails:
        _send(f'New Booking Request #{booking.order_number}', html, email)


# ── 4. Booking Confirmed ───────────────────────────────────────────────────────
def send_booking_confirmed_email(booking):
    html = _html_wrapper(
        'Your Booking is Confirmed! ✅',
        f"""
        <p style="color:#475569;">Hi <strong>{booking.user_name}</strong>,</p>
        <p style="color:#475569;">Great news! Your laundry booking has been <strong style="color:#10b981;">confirmed</strong>.</p>
        <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 6px;color:#065f46;font-weight:700;">📅 Drop-off Details</p>
          <p style="margin:0;color:#065f46;">Date: <strong>{booking.scheduled_date}</strong></p>
          <p style="margin:4px 0 0;color:#065f46;">Time: <strong>{booking.scheduled_time}</strong></p>
          <p style="margin:4px 0 0;color:#065f46;">Location: <strong>{SITE_ADDRESS}</strong></p>
        </div>
        <p style="color:#475569;"><strong>Booking ID:</strong> #{booking.order_number}</p>
        {_booking_summary_html(booking)}
        <p style="color:#475569;">Please bring your receipt or quote your booking ID when dropping off your items.</p>
        {"<p style='color:#64748b;font-size:13px;'>Payment: Online payment received via Paystack ✅</p>" if booking.payment_status == 'paid' else "<p style='color:#64748b;font-size:13px;'>Reminder: You will pay at the service counter on drop-off.</p>"}
        """,
        cta_label='View My Booking',
        cta_url=f'{settings.FRONTEND_URL}/bookings/{booking.id}'
    )
    _send(f'Booking Confirmed — #{booking.order_number}', html, booking.user_email)


# ── 5. Booking Rejected ────────────────────────────────────────────────────────
def send_booking_rejected_email(booking):
    alternatives_html = ''
    if booking.alternative_slots:
        slots = ''.join(f'<li style="padding:4px 0;color:#1a5edb;">{slot}</li>' for slot in booking.alternative_slots)
        alternatives_html = f'<p style="color:#475569;margin-top:12px;"><strong>Suggested alternative slots:</strong></p><ul style="padding-left:20px;">{slots}</ul>'

    html = _html_wrapper(
        'Booking Update — Slot Unavailable',
        f"""
        <p style="color:#475569;">Hi <strong>{booking.user_name}</strong>,</p>
        <p style="color:#475569;">Unfortunately, the time slot you requested (<strong>{booking.scheduled_date} at {booking.scheduled_time}</strong>) is no longer available.</p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#9a3412;">❌ Booking #{booking.order_number} — Slot Unavailable</p>
          {f'<p style="margin:8px 0 0;color:#9a3412;font-size:13px;">{booking.admin_notes}</p>' if booking.admin_notes else ''}
        </div>
        {alternatives_html}
        <p style="color:#475569;">Please book a new time slot at your convenience. We apologise for the inconvenience.</p>
        """,
        cta_label='Book a New Slot',
        cta_url=f'{settings.FRONTEND_URL}/services'
    )
    _send(f'Booking Update — #{booking.order_number}', html, booking.user_email)


# ── 6. Items Received ──────────────────────────────────────────────────────────
def send_items_received_email(booking):
    html = _html_wrapper(
        'We\'ve Received Your Items! 🧺',
        f"""
        <p style="color:#475569;">Hi <strong>{booking.user_name}</strong>,</p>
        <p style="color:#475569;">This is to confirm that our team has received your laundry items for order <strong>#{booking.order_number}</strong>.</p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#1e40af;font-weight:700;">⏱️ What happens next?</p>
          <p style="margin:8px 0 0;color:#1e40af;">Your items are now being processed. They will be ready for pickup in <strong>2–3 working days</strong>.</p>
          <p style="margin:8px 0 0;color:#1e40af;">We will send you another email as soon as your clothes are ready! 🎉</p>
        </div>
        {_booking_summary_html(booking)}
        <p style="color:#94a3b8;font-size:13px;">Order Reference: #{booking.order_number}</p>
        """,
        cta_label='Track My Order',
        cta_url=f'{settings.FRONTEND_URL}/bookings/{booking.id}'
    )
    _send(f'Items Received — #{booking.order_number}', html, booking.user_email)


# ── 7. Clothes Ready for Pickup ────────────────────────────────────────────────
def send_clothes_ready_email(booking):
    html = _html_wrapper(
        'Your Clothes Are Ready! 🎉',
        f"""
        <p style="color:#475569;">Hi <strong>{booking.user_name}</strong>,</p>
        <p style="color:#475569;font-size:16px;">🎊 Your laundry is <strong style="color:#10b981;">READY for pickup!</strong></p>
        <div style="background:#f0fdf4;border:2px solid #6ee7b7;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
          <p style="margin:0;font-size:32px;">✅</p>
          <p style="margin:8px 0 0;color:#065f46;font-weight:700;font-size:16px;">Order #{booking.order_number} is Ready</p>
          <p style="margin:6px 0 0;color:#065f46;">Come pick up your fresh, clean clothes!</p>
        </div>
        <div style="background:#f8faff;border:1px solid #e2e8f5;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#475569;font-weight:700;">📍 Pickup Location</p>
          <p style="margin:6px 0 0;color:#475569;">{SITE_ADDRESS}</p>
          <p style="margin:8px 0 0;color:#64748b;font-size:13px;">⏰ Opening hours: Mon–Sat, 8:00 AM – 6:00 PM</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:13px;">📌 Please bring your receipt or quote order #{booking.order_number}</p>
        </div>
        {"<p style='color:#10b981;font-weight:600;'>✅ Payment already received. No payment required at pickup.</p>" if booking.payment_status == 'paid' else f"<p style='color:#f59e0b;font-weight:600;'>💰 Amount due at pickup: <strong>₦{booking.total_amount}</strong></p>"}
        <p style="color:#64748b;font-size:13px;">This item will be held for <strong>7 days</strong>. After that, an additional storage fee may apply.</p>
        """,
        cta_label='View Order Details',
        cta_url=f'{settings.FRONTEND_URL}/bookings/{booking.id}'
    )
    _send(f'Your Clothes Are Ready — #{booking.order_number} 🎉', html, booking.user_email)
