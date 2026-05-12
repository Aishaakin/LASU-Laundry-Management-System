import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { formatNaira, formatDate, getStatusConfig } from '../../utils/helpers'

function StatCard({ icon, label, value, color, to }) {
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-card-lg transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 font-display">{value ?? '—'}</div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: bookingService.getDashboardStats,
  })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings(),
  })

  const recent = bookings.slice(0, 4)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Good day, {user?.first_name}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your LASU Viva Laundromat overview.</p>
        </div>
        <Link to="/services" className="btn-primary">
          <span className="material-symbols-outlined">add</span>
          New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="receipt_long" label="Total Orders"     value={stats?.total_orders}     color="bg-primary-600" to="/bookings" />
        <StatCard icon="autorenew"    label="Active Orders"    value={stats?.upcoming_bookings} color="bg-amber-500"   to="/bookings" />
        <StatCard icon="check_circle" label="Completed"        value={stats?.completed_orders}  color="bg-emerald-500" to="/bookings" />
        <StatCard icon="star"         label="Member Status"    value={stats?.status || 'Basic'} color="bg-violet-500" />
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/services', icon: 'dry_cleaning', label: 'Book a Service', desc: 'Select and schedule laundry' },
            { to: '/bookings', icon: 'receipt_long', label: 'My Bookings',    desc: 'Track all your orders' },
            { to: '/profile',  icon: 'person',       label: 'My Profile',     desc: 'Update your details' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary-100 group-hover:bg-primary-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-primary-600 group-hover:text-white transition-colors">{a.icon}</span>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{a.label}</div>
                <div className="text-xs text-slate-500">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-display">Recent Bookings</h2>
          <Link to="/bookings" className="text-sm text-primary-600 font-semibold hover:underline">View all →</Link>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading bookings...</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-3">🧺</span>
            <p className="text-slate-500 font-medium">No bookings yet.</p>
            <Link to="/services" className="btn-primary mt-4">Make your first booking</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(b => {
              const s = getStatusConfig(b.status)
              return (
                <Link key={b.id} to={`/bookings/${b.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary-600">local_laundry_service</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">#{b.order_number}</div>
                    <div className="text-xs text-slate-500">{b.service_name} • {formatDate(b.created_at)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-primary-600 text-sm">{formatNaira(b.total_amount)}</div>
                    <span className={`${s.color} text-xs`}>{s.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-base">chevron_right</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
