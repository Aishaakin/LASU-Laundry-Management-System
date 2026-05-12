from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model for LASU Viva Laundromat."""
    email           = models.EmailField(unique=True)
    phone_number    = models.CharField(max_length=20, blank=True)
    bio             = models.TextField(blank=True)
    member_since    = models.DateField(auto_now_add=True)
    notifications_enabled = models.BooleanField(default=True)
    status          = models.CharField(
        max_length=20,
        choices=[('basic','Basic'), ('silver','Silver'), ('gold','Gold')],
        default='basic',
    )

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)


class Service(models.Model):
    UNIT_CHOICES = [
        ('per_kg',   'Per Kilogram'),
        ('per_load', 'Per Load'),
        ('per_item', 'Per Item'),
    ]
    name        = models.CharField(max_length=100)
    description = models.TextField()
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    price_unit  = models.CharField(max_length=20, choices=UNIT_CHOICES, default='per_item')
    icon        = models.CharField(max_length=10, default='🧺')
    features    = models.JSONField(default=list)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ClothingItem(models.Model):
    CATEGORY_CHOICES = [
        ('tops',      'Tops'),
        ('bottoms',   'Bottoms'),
        ('dresses',   'Dresses'),
        ('outerwear', 'Outerwear'),
        ('others',    'Others'),
    ]
    name         = models.CharField(max_length=100)
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price        = models.DecimalField(max_digits=8, decimal_places=2)
    icon         = models.CharField(max_length=10, default='👕')
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f'{self.name} (₦{self.price})'


class SavedLocation(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    label      = models.CharField(max_length=50)
    address    = models.TextField()
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.email} — {self.label}'
