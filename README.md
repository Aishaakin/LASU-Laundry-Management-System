🧺 LASU Viva Laundromat

A full-stack laundry booking web application using Lagos State University LASU Viva Laundromat service.

Stack: React + Vite + Tailwind CSS (Frontend) · Django + PostgreSQL (Backend) · Paystack (Payments) · Gmail SMTP (Emails)

📁 Project Structure

```
lasu_viva_laundromat/
├── frontend/                   
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/           
│   │   │   ├── dashboard/     
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── BookingPage.jsx     
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── BookingDetailPage.jsx
│   │   │   ├── PaymentPage.jsx     
│   │   │   ├── PaymentSuccessPage.jsx
│   │   │   ├── PayAtServicePage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── components/
│   │   │   └── layout/        
│   │   ├── context/         
│   │   ├── services/          
│   │   └── utils/             
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── backend/                   
    ├── core/                  
    ├── laundry/                
    ├── booking/                
    ├── payment/               
    ├── notifications/         
    ├── manage.py
    └── requirements.txt

Setup Instructions

Backend (Django)
cd backend

 Create virtual environment
python -m venv venv
for Mac: source venv/bin/activate      for Windows: venv\Scripts\activate

 Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations laundry booking payment
python manage.py migrate

Start the backend server
python manage.py runserver
```

Backend API available at: `http://localhost:8000/api/v1/`
Admin dashboard: `http://localhost:8000/admin/`

---

### Frontend (React and Vite)

```bash
cd frontend

Install dependencies
npm install
Start development server
npm run dev
```

Frontend available at: `http://localhost:3000`

---

Payment Setup (Paystack)

1. Sign up at [dashboard.paystack.com](https://dashboard.paystack.com)
2. Get the Test Keys from Settings → API Keys
3. Added to backend `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxx
   ```
4. Added to frontend `.env`:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
   ```
5. Supported cards: Verve, Mastercard, Visa (Nigerian cards)
6. For live payments, switch to live keys and complete Paystack business verification

 API Reference

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

