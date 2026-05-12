from rest_framework import serializers
from .models import Booking, BookingItem, PromoCode


class BookingItemSerializer(serializers.ModelSerializer):
    clothing_item_name = serializers.CharField(source='clothing_item.name', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    class Meta:
        model = BookingItem
        fields = ['id','clothing_item','clothing_item_name','quantity','unit_price','line_total']


class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(read_only=True)
    user_email = serializers.CharField(read_only=True)
    user_phone = serializers.CharField(read_only=True)
    service_name = serializers.CharField(read_only=True)
    class Meta:
        model = Booking
        fields = ['id','order_number','user_name','user_email','user_phone',
                  'service','service_name','scheduled_date','scheduled_time',
                  'status','payment_method','payment_status',
                  'subtotal','service_fee','discount','total_amount',
                  'promo_code','notes','items','created_at','updated_at']
        read_only_fields = ['id','order_number','created_at','updated_at']


class BookingItemInputSerializer(serializers.Serializer):
    clothing_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class CreateBookingSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()
    scheduled_date = serializers.DateField()
    scheduled_time = serializers.CharField(max_length=10)
    payment_method = serializers.ChoiceField(choices=['card','at_service'])
    items = BookingItemInputSerializer(many=True, min_length=1)
    promo_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    pickup_location_id = serializers.IntegerField(required=False, allow_null=True)


class AdminBookingUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['pending','confirmed','rejected','received','processing','ready','completed','cancelled'])
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    alternative_slots = serializers.ListField(child=serializers.CharField(), required=False)
