from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Service, ClothingItem, SavedLocation


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Completely custom UserAdmin — avoids all BaseUserAdmin username conflicts."""
    list_display   = ['email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter    = ['is_staff', 'is_active', 'is_superuser']
    search_fields  = ['email', 'first_name', 'last_name']
    ordering       = ['-date_joined']
    readonly_fields = ['date_joined', 'last_login']

    fieldsets = (
        ('Account',     {'fields': ('email', 'password')}),
        ('Personal',    {'fields': ('first_name', 'last_name', 'phone_number', 'bio')}),
        ('Student',     {'fields': ('matric_number', 'department')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Dates',       {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff'),
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