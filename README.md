# 🧺 LASU Viva Laundromat

A full-stack laundry booking web application for Lagos State University.

**Stack:** React + Vite + Tailwind CSS (Frontend) · Django + PostgreSQL (Backend) · Paystack (Payments) · Gmail SMTP (Emails)

---

## 📁 Project Structure

```
lasu_viva_laundromat/
├── frontend/                   ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/           ← Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      ← DashboardPage
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── BookingPage.jsx      ← Calendar + item picker
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── BookingDetailPage.jsx
│   │   │   ├── PaymentPage.jsx      ← Paystack + Pay at Service
│   │   │   ├── PaymentSuccessPage.jsx
│   │   │   ├── PayAtServicePage.jsx ← Pay at service receipt
│   │   │   └── ProfilePage.jsx
│   │   ├── components/
│   │   │   └── layout/         ← Navbar, Footer, DashboardLayout, AuthLayout
│   │   ├── context/            ← AuthContext (JWT state)
│   │   ├── services/           ← api.js, authService, bookingService, paymentService
│   │   └── utils/              ← helpers (formatNaira, dates, PDF generation)
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── backend/                    ← Django REST Framework
    ├── core/                   ← settings.py, urls.py, wsgi.py
    ├── laundry/                ← User model, Service, ClothingItem, auth views
    ├── booking/                ← Booking model, create/list/admin views
    ├── payment/                ← Payment model, Paystack integration, PDF receipts
    ├── notifications/          ← All 7 email templates & sending logic
    ├── manage.py
    └── requirements.txt
```

---

## 🚀 Setup Instructions

### Backend (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database, email, Paystack credentials

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE lasu_viva_laundromat;"

# Run migrations
python manage.py makemigrations laundry booking payment
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Load sample data (optional)
python manage.py shell
```

In the Django shell, add sample services:
```python
from laundry.models import Service, ClothingItem
Service.objects.create(name='Wash & Fold', price=800, price_unit='per_kg', icon='🧺',
  description='Fast and efficient. Neatly washed and folded.',
  features=['Neat folding','Color separation','Same-day available'])
Service.objects.create(name='Wash & Iron', price=1500, price_unit='per_load', icon='👔',
  description='Washed, dried, and professionally pressed.',
  features=['Professional pressing','Eco-friendly','24-48h turnaround'])
ClothingItem.objects.create(name='T-Shirt', category='tops', price=200, icon='👕')
ClothingItem.objects.create(name='Jeans', category='bottoms', price=500, icon='👖')
ClothingItem.objects.create(name='Dress', category='dresses', price=700, icon='👗')
```

```bash
# Start the backend server
python manage.py runserver
```

Backend API available at: `http://localhost:8000/api/v1/`
Admin dashboard: `http://localhost:8000/admin/`

---

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend available at: `http://localhost:3000`

---

## 💳 Payment Setup (Paystack)

1. Sign up at [dashboard.paystack.com](https://dashboard.paystack.com)
2. Get your **Test Keys** from Settings → API Keys
3. Add to backend `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxx
   ```
4. Add to frontend `.env`:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
   ```
5. **Supported cards:** Verve, Mastercard, Visa (Nigerian cards)
6. For live payments, switch to live keys and complete Paystack business verification

---

## 📧 Email Setup (Gmail SMTP)

1. Enable 2-factor authentication on your Gmail account
2. Create an **App Password**: Google Account → Security → App Passwords
3. Add to backend `.env`:
   ```
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST_USER=your@gmail.com
   EMAIL_HOST_PASSWORD=your_16_char_app_password
   ```

**Email triggers (automatic):**

| Trigger | Email Sent To | Subject |
|---------|--------------|---------|
| User registers | Customer | Welcome to LASU Viva! |
| Forgot password | Customer | Password Reset Request |
| Booking submitted | Admin staff | New Booking Request #LAU-XXXXX |
| Admin confirms booking | Customer | Booking Confirmed ✅ |
| Admin rejects booking | Customer | Slot Unavailable (with alternatives) |
| Staff marks "Received" | Customer | We've Received Your Items 🧺 |
| Staff marks "Ready" | Customer | Your Clothes Are Ready! 🎉 |

---

## 🛠️ Admin Dashboard

Access at `http://localhost:8000/admin/`

**Key admin actions:**
- View all bookings, filter by status/date
- **Confirm/reject** bookings with one click (sends automatic email)
- Use bulk actions: "Mark as Confirmed", "Mark as Received", "Mark as Ready"
- Manage services, clothing items, promo codes, users

**To mark clothes as ready (triggers customer email):**
```
1. Go to Admin → Bookings
2. Find the booking
3. Use the dropdown or bulk action to set status → "Ready for Pickup"
4. Customer receives: "Your Clothes Are Ready! 🎉" email automatically
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Create account |
| POST | `/api/v1/auth/login/` | Login → JWT tokens |
| POST | `/api/v1/auth/logout/` | Logout |
| POST | `/api/v1/auth/password/reset/` | Request password reset email |
| POST | `/api/v1/auth/password/reset/confirm/` | Confirm reset with token |
| POST | `/api/v1/auth/password/change/` | Change password (authenticated) |
| GET/PATCH | `/api/v1/auth/profile/` | View/update profile |
| GET | `/api/v1/services/` | List all services |
| GET | `/api/v1/items/?category=tops` | List clothing items |
| GET | `/api/v1/bookings/available-slots/?date=2026-05-01` | Available time slots |
| POST | `/api/v1/bookings/create/` | Create booking |
| GET | `/api/v1/bookings/` | My bookings |
| GET | `/api/v1/bookings/{id}/` | Booking detail |
| POST | `/api/v1/payment/initiate/` | Start Paystack payment |
| POST | `/api/v1/payment/verify/` | Verify Paystack callback |
| GET | `/api/v1/payment/receipt/{id}/pdf/` | Download PDF receipt |
| POST | `/api/v1/promos/validate/` | Validate promo code |
| GET | `/api/v1/dashboard/` | User stats |
| GET | `/api/v1/admin/bookings/` | (Admin) All bookings |
| PATCH | `/api/v1/admin/bookings/{id}/status/` | (Admin) Update status + send email |

---

## 🗄️ Deployment (Production)

### PostgreSQL
Already configured in settings. Just set the correct `.env` values.

### Backend (Gunicorn + Nginx)
```bash
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the dist/ folder to Vercel or Netlify
# Set VITE_API_URL to your production backend URL
```

### Recommended Hosting
- **Backend:** Railway, Render, or DigitalOcean
- **Database:** Railway PostgreSQL or Supabase
- **Frontend:** Vercel (free tier)
- **Email:** Gmail SMTP (free) or SendGrid for high volume

---

## 🧑‍💻 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State/Fetching | React Context, TanStack Query, Axios |
| Forms | React Hook Form |
| Auth | JWT (access + refresh tokens) |
| Backend | Django 4.2, Django REST Framework |
| Database | PostgreSQL |
| Payments | Paystack (Verve, Mastercard, Visa) |
| PDF Receipts | ReportLab (server) + jsPDF (client) |
| Emails | Django SMTP + custom HTML templates |
| Background Tasks | Celery + Redis (optional) |
| Deployment | Gunicorn + Nginx / Vercel |
