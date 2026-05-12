// ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Could not send reset email. Please check the address and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-emerald-600 text-3xl">mark_email_read</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">Check your email</h2>
      <p className="text-slate-500 mb-6">We sent a password reset link to your email address. Click the link to reset your password.</p>
      <Link to="/auth/login" className="btn-primary">Back to Sign In</Link>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <Link to="/auth/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to sign in
      </Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">Forgot password?</h1>
      <p className="text-slate-500 mb-8">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
            <input type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
