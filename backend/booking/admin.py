from django.contrib import admin
from .models import Booking, BookingItem, PromoCode

class BookingItemInline(admin.TabularInline):
    model = BookingItem
    extra = 0
    readonly_fields = ['line_total']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['order_number','user','service','scheduled_date','scheduled_time','status','payment_method','payment_status','total_amount','created_at']
    list_filter   = ['status','payment_method','payment_status','scheduled_date']
    search_fields = ['order_number','user__email','user__first_name','user__last_name']
    readonly_fields = ['order_number','created_at','updated_at']
    inlines       = [BookingItemInline]
    actions       = ['mark_confirmed','mark_received','mark_ready','mark_completed']
    list_editable = ['status']

    def mark_confirmed(self, request, queryset):
        for b in queryset:
            b.status = 'confirmed'; b.save()
            try:
                from notifications.emails import send_booking_confirmed_email
                send_booking_confirmed_email(b)
            except: pass
    mark_confirmed.short_description = 'Mark selected as Confirmed (send email)'

    def mark_received(self, request, queryset):
        for b in queryset:
            b.status = 'received'; b.save()
            try:
                from notifications.emails import send_items_received_email
                send_items_received_email(b)
            except: pass
    mark_received.short_description = 'Mark as Received (send email)'

    def mark_ready(self, request, queryset):
        for b in queryset:
            b.status = 'ready'; b.save()
            try:
                from notifications.emails import send_clothes_ready_email
                send_clothes_ready_email(b)
            except: pass
    mark_ready.short_description = 'Mark as Ready for Pickup (send email)'

    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_completed.short_description = 'Mark as Completed'

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code','discount_type','discount_value','used_count','max_uses','valid_until','is_active']
    list_editable = ['is_active']
