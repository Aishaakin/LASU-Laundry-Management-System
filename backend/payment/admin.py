from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['reference','booking','amount','status','gateway','paid_at','created_at']
    list_filter  = ['status','gateway']
    search_fields = ['reference','booking__order_number','booking__user__email']
    readonly_fields = ['reference','gateway_ref','meta','created_at','updated_at']
