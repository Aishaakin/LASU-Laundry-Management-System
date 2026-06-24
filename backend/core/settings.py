"""
LASU Viva Laundromat — Django Settings
Reads environment variables from backend/.env file automatically
"""
from datetime import timedelta
from pathlib import Path
import os

# Try to load .env file using python-decouple (installed via requirements.txt)
try:
    from decouple import config, Csv
    def env(key, default=None, cast=str):
        return config(key, default=default, cast=cast)
    def env_list(key, default=''):
        return config(key, default=default, cast=Csv())
except ImportError:
    # Fallback to os.environ if decouple not installed yet
    def env(key, default=None, cast=str):
        val = os.environ.get(key, default)
        if cast and val is not None:
            try: return cast(val)
            except: return val
        return val
    def env_list(key, default=''):
        val = os.environ.get(key, default)
        return [v.strip() for v in val.split(',') if v.strip()]

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Core ──────────────────────────────────────────────────────────
SECRET_KEY   = env('SECRET_KEY', 'django-insecure-change-me-in-production-!!!')
DEBUG        = env('DEBUG', 'True', cast=lambda v: v.lower() in ('true', '1', 'yes'))

# ✅ UPDATED: All Vercel URLs added back with correct syntax
ALLOWED_HOSTS = env_list(
    'ALLOWED_HOSTS', 
    'localhost,127.0.0.1,0.0.0.0',
    'lasu-laundry-management-system.vercel.app',
    'lasu-laundry-management-system-5py2bnllh.vercel.app',
    'lasu-laundry-management-system-flh1upd1p.vercel.app',
    'lasu-laundry-management-system-fhl1upd1p.vercel.app',
    'lasu-laundry-management-sys-git-786918-aishas-projects-c24a2b15.vercel.app',
    'lasu-laundry-management-system-git-786918-aishas-projects-c24a2b15.vercel.app',
    'laundry-management-system-project.onrender.com'
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    # Local apps
    'laundry',
    'booking',
    'payment',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

WSGI_APPLICATION = 'core.wsgi.application'

# ── Database ──────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     env('DB_NAME',     'lasu_viva_laundromat'),
        'USER':     env('DB_USER',     'postgres'),
        'PASSWORD': env('DB_PASSWORD', 'password'),
        'HOST':     env('DB_HOST',     'localhost'),
        'PORT':     env('DB_PORT',     '5432'),
    }
}

AUTH_USER_MODEL = 'laundry.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── REST Framework ────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ── JWT ───────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES':        ('Bearer',),
}

# ── CORS ──────────────────────────────────────────────────────────
# ✅ UPDATED: All Vercel URLs added back with correct syntax
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ORIGINS', 
    'http://localhost:3000,http://127.0.0.1:3000',
    'https://lasu-laundry-management-system.vercel.app',
    'https://lasu-laundry-management-system-5py2bnllh.vercel.app',
    'https://lasu-laundry-management-system-flh1upd1p.vercel.app',
    'https://lasu-laundry-management-system-fhl1upd1p.vercel.app',
    'https://lasu-laundry-management-sys-git-786918-aishas-projects-c24a2b15.vercel.app',
    'https://lasu-laundry-management-system-git-786918-aishas-projects-c24a2b15.vercel.app',
    'https://laundry-management-system-project.onrender.com'
)

# Also allow all Vercel preview URLs
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.onrender\.com$",
]
CORS_ALLOW_CREDENTIALS = True

# ── Email ─────────────────────────────────────────────────────────
EMAIL_BACKEND       = env('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST          = env('EMAIL_HOST',    'smtp.gmail.com')
EMAIL_PORT          = env('EMAIL_PORT',    587, cast=int)
EMAIL_USE_TLS       = env('EMAIL_USE_TLS', 'True', cast=lambda v: v.lower() in ('true','1','yes'))
EMAIL_HOST_USER     = env('EMAIL_HOST_USER',     'muakin12@gmail.com')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = env('DEFAULT_FROM_EMAIL',  'LASU Viva Laundromat <muakin12@gmail.com>')

# ── Paystack ──────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY = env('PAYSTACK_SECRET_KEY', 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
PAYSTACK_PUBLIC_KEY = env('PAYSTACK_PUBLIC_KEY', 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
PAYSTACK_BASE_URL   = 'https://api.paystack.co'

# ── Frontend URL (used in email links) ────────────────────────────
# ✅ UPDATED: All Vercel URLs added back with correct syntax
FRONTEND_URL = env(
    'FRONTEND_URL', 
    'http://localhost:3000',
    'https://lasu-laundry-management-system.vercel.app',
    'https://lasu-laundry-management-system-5py2bnllh.vercel.app',
    'https://lasu-laundry-management-system-flh1upd1p.vercel.app',
    'https://lasu-laundry-management-system-fhl1upd1p.vercel.app',
    'https://lasu-laundry-management-sys-git-786918-aishas-projects-c24a2b15.vercel.app',
    'https://lasu-laundry-management-system-git-786918-aishas-projects-c24a2b15.vercel.app'
)

# ── Celery / Redis ────────────────────────────────────────────────
CELERY_BROKER_URL        = env('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND    = env('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# ── Static & Media ────────────────────────────────────────────────
STATIC_URL    = '/static/'
STATIC_ROOT   = BASE_DIR / 'staticfiles'
MEDIA_URL     = '/media/'
MEDIA_ROOT    = BASE_DIR / 'media'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ── Localisation ──────────────────────────────────────────────────
LANGUAGE_CODE = 'en-ng'
TIME_ZONE     = 'Africa/Lagos'
USE_I18N      = True
USE_TZ        = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Site Info ─────────────────────────────────────────────────────
SITE_NAME     = 'LASU Viva Laundromat'
SITE_ADDRESS  = 'LASU Main Campus, Lagos State University, Lagos, Nigeria'
SUPPORT_EMAIL = 'muakin12@gmail.com'

# ── Railway deployment ─────────────────────────────────────────────
try:
    import importlib
    dj_database_url = importlib.import_module('dj_database_url')
except (ImportError, ModuleNotFoundError):
    dj_database_url = None

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and dj_database_url:
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL, conn_max_age=600)

# ✅ Wildcard domains for ALLOWED_HOSTS
ALLOWED_HOSTS += ['.railway.app', '.up.railway.app', '.vercel.app', '.render.com']