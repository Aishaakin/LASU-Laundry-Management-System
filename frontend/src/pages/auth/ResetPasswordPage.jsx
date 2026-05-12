import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ newPassword, confirmPassword }) => {
    setLoading(true)
    try {
      await authService.resetPassword(uid, token, newPassword, confirmPassword)
      toast.success('Password reset successfully!')
      navigate('/auth/login')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired reset link.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">Set new password</h1>
      <p className="text-slate-500 mb-8">Enter your new password below.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="input-label">New Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input type="password" placeholder="Min 8 characters" className={`input pl-10 ${errors.newPassword ? 'border-red-400' : ''}`}
              {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })} />
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="input-label">Confirm Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
            <input type="password" placeholder="Repeat password" className={`input pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
              {...register('confirmPassword', {
                required: 'Required',
                validate: v => v === watch('newPassword') || 'Passwords do not match',
              })} />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-6">
        <Link to="/auth/login" className="text-primary-600 font-bold hover:underline">← Back to Sign In</Link>
      </p>
    </div>
  )
}
