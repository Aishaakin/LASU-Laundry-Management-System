import uuid, requests
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import permissions

from booking.models import Booking
from booking.serializers import BookingSerializer
from .models import Payment


PAYSTACK_SECRET = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
PAYSTACK_BASE   = 'https://api.paystack.co'
PAYSTACK_HEADERS = {'Authorization': f'Bearer {PAYSTACK_SECRET}', 'Content-Type': 'application/json'}


class InitiatePaymentView(APIView):
    def post(self, request):
        booking_id = request.data.get('booking_id')
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        if booking.payment_method == 'at_service':
            # No online payment needed — just confirm
            booking.status = 'confirmed'
            booking.save()
            try:
                from notifications.emails import send_booking_confirmed_email
                send_booking_confirmed_email(booking)
            except: pass
            return Response({'booking_id': booking.id, 'order_number': booking.order_number, 'method': 'at_service'})

        # Paystack online payment
        reference = f'LAU-{booking.order_number}-{uuid.uuid4().hex[:8].upper()}'
        amount_kobo = int(booking.total_amount * 100)  # Paystack uses kobo
        callback_url = f"{settings.FRONTEND_URL}/payment/success?reference={reference}"

        payload = {
            'email': request.user.email,
            'amount': amount_kobo,
            'reference': reference,
            'currency': 'NGN',
            'callback_url': callback_url,
            'metadata': {
                'booking_id': booking.id,
                'order_number': booking.order_number,
                'user_id': request.user.id,
            }
        }
        resp = requests.post(f'{PAYSTACK_BASE}/transaction/initialize', json=payload, headers=PAYSTACK_HEADERS)
        data = resp.json()
        if not data.get('status'):
            return Response({'error': data.get('message','Payment init failed.')}, status=400)

        Payment.objects.update_or_create(
            booking=booking,
            defaults={'reference': reference, 'amount': booking.total_amount, 'status': 'pending'}
        )

        return Response({
            'authorization_url': data['data']['authorization_url'],
            'reference': reference,
            'access_code': data['data']['access_code'],
        })


class VerifyPaymentView(APIView):
    def post(self, request):
        reference = request.data.get('reference')
        resp = requests.get(f'{PAYSTACK_BASE}/transaction/verify/{reference}', headers=PAYSTACK_HEADERS)
        data = resp.json()

        if not data.get('status') or data['data']['status'] != 'success':
            return Response({'error': 'Payment verification failed.'}, status=400)

        try:
            payment = Payment.objects.get(reference=reference)
            payment.status      = 'success'
            payment.gateway_ref = data['data'].get('id', '')
            payment.paid_at     = timezone.now()
            payment.meta        = data['data']
            payment.save()

            booking = payment.booking
            booking.payment_status = 'paid'
            booking.status = 'confirmed'
            booking.save()

            try:
                from notifications.emails import send_booking_confirmed_email
                send_booking_confirmed_email(booking)
            except: pass

            return Response({'message': 'Payment verified.', 'booking': BookingSerializer(booking).data})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found.'}, status=404)


@api_view(['GET'])
def download_receipt(request, booking_id):
    """Generate and return PDF receipt as bytes (via ReportLab)."""
    try:
        booking = Booking.objects.get(pk=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        import io

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        primary = colors.HexColor('#1a5edb')
        story = []

        # Header
        header_style = ParagraphStyle('header', fontSize=22, fontName='Helvetica-Bold', textColor=primary)
        story.append(Paragraph('LASU Viva Laundromat', header_style))
        story.append(Paragraph('Lagos State University Campus, Lagos, Nigeria', styles['Normal']))
        story.append(Paragraph('info@lasuvivalaundromat.com.ng', styles['Normal']))
        story.append(Spacer(1, 10*mm))

        # Order info
        story.append(Paragraph(f'<b>BOOKING RECEIPT</b>', ParagraphStyle('title', fontSize=16, fontName='Helvetica-Bold')))
        story.append(Spacer(1, 5*mm))
        story.append(Paragraph(f'Order Number: <b>{booking.order_number}</b>', styles['Normal']))
        story.append(Paragraph(f'Date: {booking.created_at.strftime("%d %b %Y")}', styles['Normal']))
        story.append(Paragraph(f'Status: {booking.get_status_display()}', styles['Normal']))
        story.append(Paragraph(f'Payment: {booking.get_payment_method_display()}', styles['Normal']))
        story.append(Spacer(1, 8*mm))

        # Customer
        story.append(Paragraph(f'<b>Customer:</b> {booking.user_name}', styles['Normal']))
        story.append(Paragraph(f'<b>Email:</b> {booking.user_email}', styles['Normal']))
        story.append(Paragraph(f'<b>Phone:</b> {booking.user_phone or "—"}', styles['Normal']))
        story.append(Spacer(1, 8*mm))

        # Items table
        tdata = [['Item', 'Qty', 'Unit Price', 'Total']]
        for item in booking.items.all():
            tdata.append([item.clothing_item_name, str(item.quantity), f'₦{item.unit_price}', f'₦{item.line_total}'])
        tdata.append(['', '', 'Service Fee', f'₦{booking.service_fee}'])
        if booking.discount > 0:
            tdata.append(['', '', 'Discount', f'-₦{booking.discount}'])
        tdata.append(['', '', 'TOTAL', f'₦{booking.total_amount}'])

        t = Table(tdata, colWidths=[80*mm, 20*mm, 40*mm, 40*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#f8faff')]),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (2,-1), (-1,-1), primary),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f5')),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 10*mm))
        story.append(Paragraph('Present this receipt at LASU Viva Laundromat when dropping off your items.', styles['Normal']))

        doc.build(story)
        buf.seek(0)

        from django.http import HttpResponse
        response = HttpResponse(buf.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="LASU-Viva-{booking.order_number}.pdf"'
        return response

    except ImportError:
        return Response({'error': 'PDF generation library not installed. Run: pip install reportlab'}, status=500)


@api_view(['GET'])
def payment_history(request):
    payments = Payment.objects.filter(booking__user=request.user).order_by('-created_at')
    data = [{'id': p.id, 'reference': p.reference, 'amount': str(p.amount), 'status': p.status, 'created_at': p.created_at} for p in payments]
    return Response(data)
