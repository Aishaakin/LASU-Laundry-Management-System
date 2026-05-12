import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authRegister({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword,
      })
      toast.success('Account created! Welcome to LASU Viva 🎉')
      navigate('/dashboard')
    } catch (err) {
      const errs = err.response?.data
      const msg = errs?.email?.[0] || errs?.detail || errs?.non_field_errors?.[0] || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">Create your account</h1>
      <p className="text-slate-500 mb-8">Join LASU Viva Laundromat — it's free!</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">First Name</label>
            <input placeholder="Ada" className={`input ${errors.firstName ? 'border-red-400' : ''}`}
              {...register('firstName', { required: 'Required' })} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="input-label">Last Name</label>
            <input placeholder="Okafor" className={`input ${errors.lastName ? 'border-red-400' : ''}`}
              {...register('lastName', { required: 'Required' })} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
            <input type="email" placeholder="you@example.com"
              className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
              })} />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="input-label">Phone Number</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">call</span>
            <input placeholder="08012345678"
              className={`input pl-10 ${errors.phone ? 'border-red-400' : ''}`}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[0-9+\-\s]{10,15}$/, message: 'Enter a valid phone number' }
              })} />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters"
              className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters required' }
              })} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined text-xl">{showPwd ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="input-label">Confirm Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_reset</span>
            <input type="password" placeholder="Repeat password"
              className={`input pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: v => v === watch('password') || 'Passwords do not match',
              })} />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input type="checkbox" id="agree" className="mt-0.5 accent-primary-600"
            {...register('agree', { required: 'You must agree to continue' })} />
          <label htmlFor="agree" className="text-sm text-slate-600">
            I agree to the <a href="#" className="text-primary-600 font-semibold">Terms of Service</a> and <a href="#" className="text-primary-600 font-semibold">Privacy Policy</a>
          </label>
        </div>
        {errors.agree && <p className="text-red-500 text-xs">{errors.agree.message}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
