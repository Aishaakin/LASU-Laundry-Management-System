import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/services', label: 'Services' },
        { to: '/bookings', label: 'My Bookings' },
      ]
    : [
        { to: '/#services', label: 'Services' },
        { to: '/#how-it-works', label: 'How It Works' },
        { to: '/#pricing', label: 'Pricing' },
      ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/30">
              <span className="material-symbols-outlined text-white text-xl">local_laundry_service</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-slate-900 text-base leading-none">LASU Viva</div>
              <div className="text-xs text-primary-600 font-semibold">Laundromat</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">notifications</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                      {user?.first_name || 'User'}
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-lg border border-slate-100 py-2 z-50 animate-slide-up">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">person</span> My Profile
                      </Link>
                      <Link to="/bookings" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">receipt_long</span> My Bookings
                      </Link>
                      <hr className="my-2 border-slate-100" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <span className="material-symbols-outlined text-red-400">logout</span> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="btn-ghost text-sm hidden sm:flex">Sign In</Link>
                <Link to="/auth/register" className="btn-primary text-sm">Book Now</Link>
              </>
            )}
            {/* Mobile toggle */}
            <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-slide-up">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
