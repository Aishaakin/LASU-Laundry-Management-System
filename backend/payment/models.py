from django.db import models

class Payment(models.Model):
    STATUS = [('initiated','Initiated'),('pending','Pending'),('success','Success'),('failed','Failed'),('refunded','Refunded')]
    booking     = models.OneToOneField('booking.Booking', on_delete=models.CASCADE, related_name='payment')
    reference   = models.CharField(max_length=100, unique=True)
    amount      = models.DecimalField(max_digits=10, decimal_places=2)
    currency    = models.CharField(max_length=5, default='NGN')
    status      = models.CharField(max_length=20, choices=STATUS, default='initiated')
    gateway     = models.CharField(max_length=20, default='paystack')
    gateway_ref = models.CharField(max_length=200, blank=True)
    paid_at     = models.DateTimeField(null=True, blank=True)
    meta        = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    def __str__(self): return f'{self.reference} [{self.status}]'
