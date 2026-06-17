// AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2f7bf7 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1a5edb 0%, transparent 50%)' }} />
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white">local_laundry_service</span>
          </div>
          <div>
            <div className="text-white font-bold text-lg font-display">LASU Viva</div>
            <div className="text-primary-300 text-xs font-semibold">Laundromat</div>
          </div>
        </Link>
        {/* Hero text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4 font-display">
            Clean clothes,<br />
            <span className="text-primary-400">zero effort.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-sm">
            Book your laundry service online. Pay with card or at the service counter. We'll notify you when your clothes are ready.
          </p>
          <div className="flex flex-col gap-3">
            {['Naira-based pricing', 'Paystack & card payments',  'Email notifications for your orders'].map(t => (
              <div key={t} className="text-slate-300 text-sm">{t}</div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs relative z-10">© 2026 LASU Viva Laundromat. Lagos State University.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">local_laundry_service</span>
              </div>
              <span className="font-bold text-slate-900 font-display">LASU Viva Laundromat</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
