import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Protected pages
import DashboardPage from './pages/dashboard/DashboardPage'
import ServicesPage from './pages/ServicesPage'
import BookingPage from './pages/BookingPage'
import MyBookingsPage from './pages/MyBookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PayAtServicePage from './pages/PayAtServicePage'
import ProfilePage from './pages/ProfilePage'

// Staff pages
import StaffLoginPage from './pages/staff/StaffLoginPage'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading LASU Viva...</p>
      </div>
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />
}

function StaffRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/staff/login" replace />
  if (!user?.is_staff) return <Navigate to="/" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={
            <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
          } />
          <Route path="/auth/register" element={
            <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
          } />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        </Route>

      {/* Staff Portal */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/dashboard" element={
        <StaffRoute><StaffDashboardPage /></StaffRoute>
} />

        {/* Protected app */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/book/:serviceId" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/pay-at-service/:bookingId" element={<PayAtServicePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
