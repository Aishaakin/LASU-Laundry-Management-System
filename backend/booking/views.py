from decimal import Decimal
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, BookingItem, PromoCode
from .serializers import BookingSerializer, CreateBookingSerializer, AdminBookingUpdateSerializer
from laundry.models import Service, ClothingItem, SavedLocation

SERVICE_FEE = Decimal('200.00')

def apply_promo(code_str, subtotal):
    from django.utils import timezone
    today = timezone.now().date()
    try:
        p = PromoCode.objects.get(code=code_str.upper(),is_active=True,valid_from__lte=today,valid_until__gte=today)
        if p.used_count >= p.max_uses: return Decimal('0')
        if p.discount_type == 'percentage':
            return (subtotal * p.discount_value / 100).quantize(Decimal('0.01'))
        return min(p.discount_value, subtotal)
    except PromoCode.DoesNotExist:
        return Decimal('0')


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    def get_queryset(self):
        qs = Booking.objects.filter(user=self.request.user).prefetch_related('items__clothing_item')
        s = self.request.query_params.get('status')
        if s: qs = qs.filter(status=s)
        return qs


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).prefetch_related('items__clothing_item')


class BookingCreateView(APIView):
    def post(self, request):
        s = CreateBookingSerializer(data=request.data)
        if not s.is_valid(): return Response(s.errors, status=400)
        data = s.validated_data
        try:
            service = Service.objects.get(pk=data['service_id'], is_active=True)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found.'}, status=400)
        item_data, subtotal = [], Decimal('0')
        for inp in data['items']:
            try:
                item = ClothingItem.objects.get(pk=inp['clothing_item_id'], is_available=True)
            except ClothingItem.DoesNotExist:
                return Response({'error': f"Item {inp['clothing_item_id']} not found."}, status=400)
            subtotal += item.price * inp['quantity']
            item_data.append({'item': item, 'qty': inp['quantity'], 'price': item.price})
        promo_str = data.get('promo_code','').strip().upper()
        discount = apply_promo(promo_str, subtotal) if promo_str else Decimal('0')
        total = subtotal + SERVICE_FEE - discount
        pickup_loc = None
        if data.get('pickup_location_id'):
            try: pickup_loc = SavedLocation.objects.get(pk=data['pickup_location_id'], user=request.user)
            except: pass
        booking = Booking.objects.create(
            user=request.user, service=service,
            scheduled_date=data['scheduled_date'], scheduled_time=data['scheduled_time'],
            payment_method=data['payment_method'], promo_code=promo_str,
            notes=data.get('notes',''), pickup_location=pickup_loc,
            subtotal=subtotal+SERVICE_FEE, service_fee=SERVICE_FEE,
            discount=discount, total_amount=total,
        )
        for i in item_data:
            BookingItem.objects.create(booking=booking,clothing_item=i['item'],quantity=i['qty'],unit_price=i['price'])
        try:
            from notifications.emails import send_booking_request_email
            send_booking_request_email(booking)
        except: pass
        return Response(BookingSerializer(booking).data, status=201)


class AdminBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Booking.objects.all().select_related('user','service').prefetch_related('items__clothing_item')
    filterset_fields = ['status','payment_method','payment_status']
    search_fields = ['order_number','user__email','user__first_name']
    ordering_fields = ['created_at','scheduled_date','total_amount']


class AdminBookingUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        s = AdminBookingUpdateSerializer(data=request.data)
        if not s.is_valid(): return Response(s.errors, status=400)
        new_status = s.validated_data['status']
        booking.status = new_status
        if s.validated_data.get('admin_notes'): booking.admin_notes = s.validated_data['admin_notes']
        if s.validated_data.get('alternative_slots'): booking.alternative_slots = s.validated_data['alternative_slots']
        booking.save()
        email_sent = False
        try:
            from notifications.emails import (send_booking_confirmed_email, send_booking_rejected_email,
                                               send_items_received_email, send_clothes_ready_email)
            if new_status == 'confirmed': send_booking_confirmed_email(booking); email_sent=True
            elif new_status == 'rejected': send_booking_rejected_email(booking); email_sent=True
            elif new_status == 'received': send_items_received_email(booking); email_sent=True
            elif new_status == 'ready': send_clothes_ready_email(booking); email_sent=True
        except: pass
        return Response({'message':f"Status '{new_status}' set.{'Email sent.' if email_sent else ''}","booking":BookingSerializer(booking).data})


@api_view(['POST'])
def validate_promo(request):
    from django.utils import timezone
    code = request.data.get('code','').strip().upper()
    today = timezone.now().date()
    try:
        p = PromoCode.objects.get(code=code,is_active=True,valid_from__lte=today,valid_until__gte=today)
        if p.used_count >= p.max_uses:
            return Response({'valid':False,'message':'Usage limit reached.'})
        return Response({'valid':True,'code':p.code,'discount_type':p.discount_type,'discount_value':str(p.discount_value)})
    except PromoCode.DoesNotExist:
        return Response({'valid':False,'message':'Invalid or expired code.'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def available_slots(request):
    date = request.query_params.get('date')
    all_slots = ['08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30']
    if date:
        booked = Booking.objects.filter(scheduled_date=date,status__in=['pending','confirmed']).values_list('scheduled_time',flat=True)
        available = [s for s in all_slots if s not in booked]
    else:
        available = all_slots
    return Response({'slots':available,'date':date})
