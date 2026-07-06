from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Service, ClothingItem, SavedLocation


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ['email', 'first_name', 'last_name', 'status', 'is_staff', 'date_joined']
    list_filter    = ['status', 'is_staff', 'is_active']
    search_fields  = ['email', 'first_name', 'last_name']
    ordering       = ['-date_joined']

    # Override fieldsets — use email not username
    fieldsets = (
        (None,               {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'bio')}),
        (_('Student info'),  {'fields': ('matric_number', 'department')}),
        (_('Permissions'),   {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Status'),        {'fields': ('status', 'notifications_enabled')}),
        (_('Important dates'),{'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ['name', 'price', 'price_unit', 'is_active']
    list_editable = ['is_active']


@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display  = ['name', 'category', 'price', 'is_available']
    list_filter   = ['category', 'is_available']
    list_editable = ['price', 'is_available']


admin.site.register(SavedLocation)
