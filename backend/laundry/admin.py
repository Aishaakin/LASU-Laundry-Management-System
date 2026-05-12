from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Service, ClothingItem, SavedLocation

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['email','first_name','last_name','status','is_staff','date_joined']
    list_filter   = ['status','is_staff','is_active']
    search_fields = ['email','first_name','last_name']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('phone_number','bio','status','notifications_enabled')}),
    )

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name','price','price_unit','is_active']
    list_editable = ['is_active']

@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ['name','category','price','is_available']
    list_filter  = ['category','is_available']
    list_editable = ['price','is_available']

admin.site.register(SavedLocation)
