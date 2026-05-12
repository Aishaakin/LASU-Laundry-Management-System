from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'LASU Viva Laundromat Admin'
admin.site.site_title  = 'LASU Viva Admin'
admin.site.index_title = 'Staff Dashboard'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('laundry.urls')),
    path('api/v1/', include('booking.urls')),
    path('api/v1/', include('payment.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
