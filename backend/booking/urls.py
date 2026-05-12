from django.urls import path
from . import views

urlpatterns = [
    path('bookings/',                        views.BookingListView.as_view()),
    path('bookings/create/',                 views.BookingCreateView.as_view()),
    path('bookings/<int:pk>/',               views.BookingDetailView.as_view()),
    path('bookings/available-slots/',        views.available_slots),
    path('promos/validate/',                 views.validate_promo),
    # Admin
    path('admin/bookings/',                  views.AdminBookingListView.as_view()),
    path('admin/bookings/<int:pk>/status/',  views.AdminBookingUpdateView.as_view()),
]
