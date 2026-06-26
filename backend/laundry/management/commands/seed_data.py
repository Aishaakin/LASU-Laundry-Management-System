from django.core.management.base import BaseCommand
from laundry.models import Service, ClothingItem, User


class Command(BaseCommand):
    help = 'Seed initial data for LASU Viva Laundromat'

    def handle(self, *args, **kwargs):

        # ── Services ──────────────────────────────────────────────
        services = [
            (1, 'Wash & Fold',  'Fast and efficient. Neatly washed and folded.',     200, 'per_kg',   '🧺', ['Neat folding', 'Color separation', 'Same-day available']),
            (2, 'Wash & Iron',  'Washed, dried, and professionally pressed.',        200, 'per_load', '👔', ['Professional pressing', 'Eco-friendly', '24-48h turnaround']),
            (3, 'Dry Cleaning', 'Expert care for suits, silk, and formal garments.', 200, 'per_item', '✨', ['Eco-safe solvents', 'Hanger delivery', 'Stain treatment']),
        ]

        for id, name, desc, price, unit, icon, features in services:
            obj, created = Service.objects.get_or_create(
                id=id,
                defaults={
                    'name':        name,
                    'description': desc,
                    'price':       price,
                    'price_unit':  unit,
                    'icon':        icon,
                    'features':    features,
                    'is_active':   True,
                }
            )
            self.stdout.write(f"{'Created' if created else 'Exists'}: {name}")

        # ── Clothing Items ────────────────────────────────────────
        items = [
            (1,  'T-Shirt',    'tops',      200,  '👕'),
            (2,  'Shirt',      'tops',      350,  '👔'),
            (3,  'Blouse',     'tops',      350,  '👗'),
            (4,  'Sweater',    'tops',      500,  '🧥'),
            (5,  'Jeans',      'bottoms',   500,  '👖'),
            (6,  'Trousers',   'bottoms',   450,  '👖'),
            (7,  'Shorts',     'bottoms',   250,  '🩳'),
            (8,  'Dress',      'dresses',   700,  '👗'),
            (9,  'Gown',       'dresses',   900,  '👗'),
            (10, 'Jacket',     'outerwear', 800,  '🧥'),
            (11, 'Coat',       'outerwear', 1200, '🥼'),
            (12, 'Bed Sheet',  'others',    600,  '🛏️'),
            (13, 'Towel',      'others',    300,  '🪥'),
        ]

        for id, name, cat, price, icon in items:
            obj, created = ClothingItem.objects.get_or_create(
                id=id,
                defaults={
                    'name':         name,
                    'category':     cat,
                    'price':        price,
                    'icon':         icon,
                    'is_available': True,
                }
            )
            self.stdout.write(f"{'Created' if created else 'Exists'}: {name}")

        # ── Staff Account ─────────────────────────────────────────
        staff, created = User.objects.get_or_create(
            email='staff@lasuviva.com',
            defaults={
                'username':   'staff@lasuviva.com',
                'first_name': 'Laundry',
                'last_name':  'Staff',
                'is_staff':   True,
                'is_active':  True,
            }
        )
        # Always set password whether the account was just created or already existed
        staff.set_password('LasuViva2026')
        staff.username  = 'staff@lasuviva.com'
        staff.is_staff  = True
        staff.is_active = True
        staff.save()
        self.stdout.write(f"{'Created' if created else 'Updated'} staff account: staff@lasuviva.com")

        # ── Superuser ─────────────────────────────────────────────
        admin, created = User.objects.get_or_create(
            email='muakin12@gmail.com',
            defaults={
                'username':      'muakin12@gmail.com',
                'first_name':    'Admin',
                'last_name':     'LASU',
                'is_staff':      True,
                'is_superuser':  True,
                'is_active':     True,
            }
        )
        # Always update password whether the account was just created or already existed
        admin.set_password('LasuAdmin2026!')
        admin.is_staff     = True
        admin.is_superuser = True
        admin.save()
        self.stdout.write(f"{'Created' if created else 'Updated'} superuser: {admin.email}")

        self.stdout.write(self.style.SUCCESS('✅ Seeding complete!'))