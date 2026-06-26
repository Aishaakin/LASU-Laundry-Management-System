"""
LASU Viva Laundromat — Django Settings
"""
from datetime import timedelta
from pathlib import Path
import os

try:
    from decouple import config, Csv
    def env(key, default=None, cast=str):
        return config(key, default=default, cast=cast)
    def env_list(key, default=''):
        raw = os.environ.get(key, default)
        return [v.strip() for v in raw.split(',') if v.strip()]
except ImportError:
    def env(key, default=None, cast=str):
        val = os.environ.get(key, default)
        if cast and val is not None:
            try:
                return cast(val)
            except:
                return val
        return val
    def env_list(key, default=''):
        val = os.environ.get(key, default)
        return [v.strip() for v in val.split(',') if v.strip()]

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Core ──────────────────────────────────────────────────────────
SECRET_KEY = env('SECRET_KEY', 'django-insecure-change-me-in-production')
DEBUG      = env('DEBUG', 'False', cast=lambda v: v.lower() in ('true', '1', 'yes'))

# Build ALLOWED_HOSTS from environment
_raw_hosts = os.environ.get(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,0.0.0.0'
)
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(',') if h.strip()]

# Always include these
for _h in ['localhost', '127.0.0.1', '.onrender.com', '.vercel.app']:
    if _h not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(_h)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
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
# Start with local default
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

# Override with DATABASE_URL if present (Render/Railway)
_DATABASE_URL = os.environ.get('DATABASE_URL')
if _DATABASE_URL:
    try:
        import dj_database_url
        DATABASES['default'] = dj_database_url.parse(
            _DATABASE_URL, conn_max_age=600
        )
    except ImportError:
        pass

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
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://lasu-laundry-management-system.vercel.app',
]

# Allow all Vercel and Render preview URLs
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.vercel\.app$',
    r'^https://.*\.onrender\.com$',
]

# Also parse from environment variable if set
_cors_env = os.environ.get('CORS_ORIGINS', '')
if _cors_env:
    for _origin in _cors_env.split(','):
        _origin = _origin.strip()
        if _origin and _origin not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(_origin)

CORS_ALLOW_CREDENTIALS = True

# ── Email ─────────────────────────────────────────────────────────
EMAIL_BACKEND       = env('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST          = env('EMAIL_HOST',    'smtp.gmail.com')
EMAIL_PORT          = env('EMAIL_PORT',    587, cast=int)
EMAIL_USE_TLS       = env('EMAIL_USE_TLS', 'True', cast=lambda v: v.lower() in ('true','1','yes'))
EMAIL_HOST_USER     = env('EMAIL_HOST_USER',     '')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = env('DEFAULT_FROM_EMAIL',  'LASU Viva Laundromat <noreply@lasuviva.com>')

# ── Paystack ──────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY = env('PAYSTACK_SECRET_KEY', '')
PAYSTACK_PUBLIC_KEY = env('PAYSTACK_PUBLIC_KEY', '')
PAYSTACK_BASE_URL   = env('PAYSTACK_BASE_URL',   'https://api.paystack.co')

# ── Frontend URL ──────────────────────────────────────────────────
FRONTEND_URL = env('FRONTEND_URL', 'https://lasu-laundry-management-system.vercel.app')

# ── Celery ────────────────────────────────────────────────────────
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
SUPPORT_EMAIL = env('EMAIL_HOST_USER', 'help@lasuvivalaundromat.com.ng')

# ----- CSRF Trusted Origins (for production) -----
CSRF_TRUSTED_ORIGINS = [
    'https://lasu-laundry-management-system.fly.dev',
    'https://lasu-laundry-management-system.vercel.app',
    'https://laundry-management-system-project.onrender.com',
]