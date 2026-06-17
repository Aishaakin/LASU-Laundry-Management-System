import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function StaffLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      if (!user.is_staff) {
        toast.error('Access denied. Staff accounts only.')
        return
      }
      toast.success(`Welcome, ${user.first_name}! 👋`)
      navigate('/staff/dashboard')
    } catch {
      toast.error('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/40">
            <span className="material-symbols-outlined text-white text-3xl">local_laundry_service</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">LASU Viva Laundromat</h1>
          <p className="text-slate-400 text-sm mt-1">Staff Portal — Authorized Access Only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-display">Staff Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="input-label">Staff Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input type="email" placeholder="staff@lasuviva.com"
                  className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Email is required' })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined text-xl">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In to Staff Portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Customer? <a href="/" className="text-primary-400 hover:underline">Go to main site →</a>
        </p>
      </div>
    </div>
  )
}