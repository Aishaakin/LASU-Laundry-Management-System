from django.urls import path
from . import views

urlpatterns = [
    path('payment/initiate/',        views.InitiatePaymentView.as_view()),
    path('payment/verify/',          views.VerifyPaymentView.as_view()),
    path('payment/receipt/<int:booking_id>/pdf/', views.download_receipt),
    path('payment/history/',         views.payment_history),
]
