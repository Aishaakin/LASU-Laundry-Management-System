import random
from django.db import models
from django.conf import settings


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending','Pending'),('confirmed','Confirmed'),('rejected','Rejected'),
        ('received','Received'),('processing','Processing'),('ready','Ready'),
        ('completed','Completed'),('cancelled','Cancelled'),
    ]
    PAYMENT_METHOD = [('card','Card'),('at_service','At Service')]
    PAYMENT_STATUS = [('pending','Pending'),('paid','Paid'),('failed','Failed'),('refunded','Refunded')]

    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    service        = models.ForeignKey('laundry.Service', on_delete=models.SET_NULL, null=True)
    order_number   = models.CharField(max_length=20, unique=True, blank=True)
    scheduled_date = models.DateField()
    scheduled_time = models.CharField(max_length=10)
    pickup_location= models.ForeignKey('laundry.SavedLocation', on_delete=models.SET_NULL, null=True, blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD, default='at_service')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    subtotal       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee    = models.DecimalField(max_digits=8,  decimal_places=2, default=500)
    discount       = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    total_amount   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    promo_code     = models.CharField(max_length=30, blank=True)
    notes          = models.TextField(blank=True)
    admin_notes    = models.TextField(blank=True)
    alternative_slots = models.JSONField(default=list, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'LAU-{random.randint(10000,99999)}'
        super().save(*args, **kwargs)

    @property
    def user_name(self):  return self.user.get_full_name()
    @property
    def user_email(self): return self.user.email
    @property
    def user_phone(self): return self.user.phone_number
    @property
    def service_name(self): return self.service.name if self.service else ''

    def __str__(self): return f'#{self.order_number}'


class BookingItem(models.Model):
    booking       = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    clothing_item = models.ForeignKey('laundry.ClothingItem', on_delete=models.SET_NULL, null=True)
    quantity      = models.PositiveIntegerField(default=1)
    unit_price    = models.DecimalField(max_digits=8, decimal_places=2)

    @property
    def line_total(self): return self.quantity * self.unit_price
    @property
    def clothing_item_name(self): return self.clothing_item.name if self.clothing_item else ''


class PromoCode(models.Model):
    code           = models.CharField(max_length=30, unique=True)
    discount_type  = models.CharField(max_length=15, choices=[('percentage','%'),('flat','Flat')])
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    max_uses       = models.PositiveIntegerField(default=100)
    used_count     = models.PositiveIntegerField(default=0)
    valid_from     = models.DateField()
    valid_until    = models.DateField()
    is_active      = models.BooleanField(default=True)

    def __str__(self): return self.code
