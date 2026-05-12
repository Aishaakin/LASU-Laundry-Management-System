"""
LASU Viva Laundromat — Email Notification Service

Triggered by admin actions in the booking admin panel.
Uses Django's email backend (configure SMTP in settings.py).
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

SITE_NAME    = getattr(settings, 'SITE_NAME',    'LASU Viva Laundromat')
SITE_ADDRESS = getattr(settings, 'SITE_ADDRESS', 'LASU Main Campus, Lagos')
SUPPORT_EMAIL = getattr(settings, 'SUPPORT_EMAIL', 'help@lasuvivalaundromat.com.ng')
FROM_EMAIL   = settings.DEFAULT_FROM_EMAIL


def _send_html_email(subject, to_email, html_content, plain_text=''):
    """Helper to send an HTML email."""
    try:
        msg = EmailMultiAlternatives(
            subject   = subject,
            body      = plain_text or 'Please view this email in an HTML email client.',
            from_email = FROM_EMAIL,
            to        = [to_email],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send()
        logger.info(f'Email sent: "{subject}" → {to_email}')
        return True
    except Exception as e:
        logger.error(f'Email FAILED: "{subject}" → {to_email}: {e}')
        return False


def _base_email(title, subtitle, body_html, booking=None):
    """Wrap content in a branded HTML email template."""
    accent  = '#1a5edb'
    order_info = ''
    if booking:
        order_info = f'''
        <div style="background:#f4f6fb;border-radius:12px;padding:16px 20px;margin:20px 0;text-align:center;">
            <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Order Number</div>
            <div style="font-size:28px;font-weight:900;color:{accent};font-family:Georgia,serif;">#{booking.order_number}</div>
        </div>
        '''

    return f'''<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{title}</title></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(26,94,219,.10);">

  <!-- Header -->
  <tr><td style="background:{accent};padding:36px 40px;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">🧺</div>
    <div style="color:white;font-size:22px;font-weight:800;letter-spacing:-.3px;">{SITE_NAME}</div>
    <div style="color:rgba(255,255,255,.7);font-size:13px;margin-top:4px;">Lagos State University</div>
  </td></tr>

  <!-- Subtitle banner -->
  <tr><td style="background:#eef6ff;padding:16px 40px;text-align:center;border-bottom:1px solid #dbeafe;">
    <div style="font-size:15px;font-weight:700;color:{accent};">{subtitle}</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 40px;">
    {order_info}
    {body_html}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">{SITE_ADDRESS}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Support: <a href="mailto:{SUPPORT_EMAIL}" style="color:{accent};">{SUPPORT_EMAIL}</a></p>
    <p style="margin:0;font-size:11px;color:#94a3b8;">© 2024 {SITE_NAME}. All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>'''


# ── Individual notification functions ─────────────────────────────────────────

def send_welcome_email(user):
    body = f'''
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
    <p style="font-size:15px;color:#334155;line-height:1.7;">
        Welcome to <strong>{SITE_NAME}</strong>! Your account is ready.
        You can now book laundry services online, pay securely, and get notified when your clothes are ready.
    </p>
    <div style="text-align:center;margin:28px 0;">
        <a href="{settings.FRONTEND_URL}/services"
           style="background:#1a5edb;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
           Book Your First Wash →
        </a>
    </div>
    <p style="font-size:14px;color:#64748b;line-height:1.7;">
        Questions? Just reply to this email or contact us at {SUPPORT_EMAIL}.
    </p>
    '''
    html = _base_email('Welcome to LASU Viva Laundromat!', '🎉 Welcome aboard!', body)
    _send_html_email(f'Welcome to {SITE_NAME}!', user.email, html)


def send_booking_confirmation_email(booking, pending=False):
    user = booking.user
    if pending:
        subtitle = '⏳ Booking Request Received — Under Review'
        body_msg = f'''
        <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
        <p style="font-size:15px;color:#334155;line-height:1.7;">
            We've received your laundry booking request. Our team will review the availability and confirm your slot within a few hours.
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.7;">
            <strong>Requested drop-off:</strong> {booking.scheduled_date} at {booking.scheduled_time}
        </p>
        <p style="font-size:14px;color:#64748b;">You'll receive another email once your booking is confirmed or if we need to suggest an alternative slot.</p>
        '''
    else:
        subtitle = '✅ Booking Confirmed!'
        body_msg = f'''
        <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
        <p style="font-size:15px;color:#334155;line-height:1.7;">
            Great news! Your laundry booking has been <strong>confirmed</strong>.
        </p>
        <table width="100%" style="background:#f4f6fb;border-radius:12px;padding:16px;margin:16px 0;border-collapse:collapse;">
            <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Service</td><td style="padding:6px 16px;font-size:14px;font-weight:600;">{booking.service_name}</td></tr>
            <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Drop-off Date</td><td style="padding:6px 16px;font-size:14px;font-weight:600;">{booking.scheduled_date}</td></tr>
            <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Time Slot</td><td style="padding:6px 16px;font-size:14px;font-weight:600;">{booking.scheduled_time}</td></tr>
            <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Total</td><td style="padding:6px 16px;font-size:14px;font-weight:700;color:#1a5edb;">₦{booking.total_amount:,.0f}</td></tr>
            <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Payment</td><td style="padding:6px 16px;font-size:14px;font-weight:600;">{booking.get_payment_method_display()}</td></tr>
        </table>
        <div style="background:#d1fae5;border-radius:10px;padding:14px 18px;margin:16px 0;border-left:4px solid #10b981;">
            <p style="margin:0;font-size:14px;color:#065f46;font-weight:600;">
                📍 Drop-off Location: LASU Viva Laundromat, Main Campus, Lagos State University
            </p>
        </div>
        '''

    html = _base_email(
        f'Booking {"Request" if pending else "Confirmed"} — {SITE_NAME}',
        subtitle,
        body_msg,
        booking
    )
    _send_html_email(
        f'{"Booking Request Received" if pending else "Booking Confirmed!"} — #{booking.order_number}',
        user.email, html
    )


def send_booking_rejected_email(booking):
    user = booking.user
    alt_html = ''
    if booking.alternative_slots:
        alts = ''.join([f'<li style="margin:6px 0;font-size:14px;">{slot}</li>' for slot in booking.alternative_slots])
        alt_html = f'<p style="font-weight:700;color:#334155;margin-top:20px;">Suggested alternative slots:</p><ul style="padding-left:20px;color:#475569;">{alts}</ul>'

    body = f'''
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
    <p style="font-size:15px;color:#334155;line-height:1.7;">
        Unfortunately, we're unable to accommodate your booking for <strong>{booking.scheduled_date} at {booking.scheduled_time}</strong>.
        That slot is currently full.
    </p>
    {f'<p style="font-size:14px;color:#64748b;">{booking.rejection_reason}</p>' if booking.rejection_reason else ''}
    {alt_html}
    <div style="text-align:center;margin:28px 0;">
        <a href="{settings.FRONTEND_URL}/book/{booking.service_id if booking.service else ''}"
           style="background:#1a5edb;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
           Choose Another Slot →
        </a>
    </div>
    <p style="font-size:14px;color:#64748b;">Need help? Contact us at {SUPPORT_EMAIL}</p>
    '''
    html = _base_email(
        f'Booking Update — {SITE_NAME}',
        '😕 Slot Unavailable — Please Rebook',
        body, booking
    )
    _send_html_email(f'Booking Update: Slot Unavailable — #{booking.order_number}', user.email, html)


def send_items_received_email(booking):
    """
    Sent when staff marks order as "received" after customer drops off items.
    Message: "Your items have been received. Ready in 2-3 days."
    """
    user  = booking.user
    items = booking.items.all()
    items_list = ''.join([
        f'<tr><td style="padding:6px 16px;font-size:13px;color:#475569;">{i.quantity}× {i.clothing_item_name}</td><td style="padding:6px 16px;font-size:13px;font-weight:600;text-align:right;">₦{i.line_total:,.0f}</td></tr>'
        for i in items
    ])
    body = f'''
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
    <div style="background:#ede9fe;border-radius:12px;padding:16px 20px;margin:16px 0;border-left:4px solid #7c3aed;">
        <p style="margin:0;font-size:15px;color:#5b21b6;font-weight:700;">
            🧺 LASU VIVA Laundry: Your items have been received and are being processed. Ready in 2-3 days. Order ID: #{booking.order_number}
        </p>
    </div>
    <table width="100%" style="background:#f4f6fb;border-radius:12px;margin:16px 0;border-collapse:collapse;">
        <tr style="background:#e2e8f0;"><td style="padding:8px 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Item</td><td style="padding:8px 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:right;">Price</td></tr>
        {items_list}
        <tr style="border-top:2px solid #e2e8f0;"><td style="padding:10px 16px;font-weight:700;font-size:14px;">Total</td><td style="padding:10px 16px;font-weight:900;font-size:16px;color:#1a5edb;text-align:right;">₦{booking.total_amount:,.0f}</td></tr>
    </table>
    <p style="font-size:14px;color:#64748b;line-height:1.7;">
        We'll send you another email as soon as your clothes are ready for pickup. Expected: <strong>2-3 business days</strong>.
    </p>
    <p style="font-size:14px;color:#64748b;">Questions? Email us at {SUPPORT_EMAIL}</p>
    '''
    html = _base_email(
        f'Items Received — {SITE_NAME}',
        '📦 Items Received — Ready in 2-3 Days!',
        body, booking
    )
    _send_html_email(f'Your Items Are Being Processed — #{booking.order_number}', user.email, html)


def send_clothes_ready_email(booking):
    """
    Sent when staff marks order as "ready".
    Message: "Your clothes are ready for pickup!"
    """
    user = booking.user
    body = f'''
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
    <div style="background:#d1fae5;border-radius:12px;padding:20px 24px;margin:16px 0;border-left:4px solid #10b981;text-align:center;">
        <div style="font-size:36px;margin-bottom:8px;">🎉</div>
        <p style="margin:0;font-size:17px;color:#065f46;font-weight:800;line-height:1.4;">
            ✅ LASU VIVA Laundry: Your order #{booking.order_number} is READY for pickup!<br/>
            Bring your receipt to collect. Valid for 7 days.
        </p>
    </div>
    <table width="100%" style="background:#f4f6fb;border-radius:12px;padding:16px;margin:16px 0;border-collapse:collapse;">
        <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;">Order</td><td style="padding:6px 16px;font-size:14px;font-weight:700;color:#1a5edb;">#{booking.order_number}</td></tr>
        <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;">Total</td><td style="padding:6px 16px;font-size:14px;font-weight:700;">₦{booking.total_amount:,.0f}</td></tr>
        <tr><td style="padding:6px 16px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;">Payment</td><td style="padding:6px 16px;font-size:14px;font-weight:600;">{booking.get_payment_method_display()}</td></tr>
    </table>
    <div style="background:#fef3c7;border-radius:10px;padding:14px 18px;margin:16px 0;border-left:4px solid #f59e0b;">
        <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
            📍 Pickup Location: LASU Viva Laundromat, Main Campus, Lagos State University<br/>
            🕐 Collection valid for 7 days from this notification.
        </p>
    </div>
    {"<p style='font-size:14px;color:#64748b;'>Please bring <strong>cash or bank transfer</strong> to complete payment at the counter.</p>" if booking.payment_method == 'at_service' else ""}
    <div style="text-align:center;margin:28px 0;">
        <a href="{settings.FRONTEND_URL}/bookings/{booking.id}"
           style="background:#10b981;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
           View Order Details →
        </a>
    </div>
    '''
    html = _base_email(
        f'Your Clothes Are Ready — {SITE_NAME}',
        '🎉 Your Laundry is Ready for Pickup!',
        body, booking
    )
    _send_html_email(f'Your Clothes Are Ready for Pickup! — #{booking.order_number}', user.email, html)


def send_password_reset_email(user, reset_url):
    body = f'''
    <p style="font-size:16px;color:#334155;line-height:1.7;">Hi <strong>{user.first_name}</strong>,</p>
    <p style="font-size:15px;color:#334155;line-height:1.7;">
        We received a request to reset your LASU Viva Laundromat password. Click the button below to create a new password.
    </p>
    <div style="text-align:center;margin:32px 0;">
        <a href="{reset_url}"
           style="background:#1a5edb;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
           Reset My Password →
        </a>
    </div>
    <p style="font-size:13px;color:#94a3b8;line-height:1.7;">
        This link expires in 24 hours. If you didn't request a reset, please ignore this email — your account is safe.
    </p>
    <p style="font-size:12px;color:#cbd5e1;">Or copy this URL: {reset_url}</p>
    '''
    html = _base_email('Reset Your Password', '🔐 Password Reset Request', body)
    _send_html_email('Reset Your LASU Viva Password', user.email, html)
