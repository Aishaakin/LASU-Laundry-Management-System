import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { formatNaira, formatDate, getStatusConfig } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ── API helpers ──────────────────────────────────────────────────
// const fetchAllBookings = () => api.get('/admin/bookings/').then(r => r.data)
const fetchAllBookings = () =>
  api.get('/admin/bookings/').then(r => {
    // Handle both paginated { results: [] } and plain array responses
    const data = r.data
    return Array.isArray(data) ? data : (data.results || [])
  })


const fetchStats = () => api.get('/dashboard/').then(r => r.data)
const updateStatus = ({ id, status, admin_notes }) =>
  api.patch(`/admin/bookings/${id}/status/`, { status, admin_notes }).then(r => r.data)

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    pending:    'bg-amber-100 text-amber-700',
    confirmed:  'bg-blue-100 text-blue-700',
    rejected:   'bg-red-100 text-red-700',
    received:   'bg-indigo-100 text-indigo-700',
    processing: 'bg-purple-100 text-purple-700',
    ready:      'bg-emerald-100 text-emerald-700',
    completed:  'bg-slate-100 text-slate-600',
    cancelled:  'bg-red-50 text-red-400',
  }
  const labels = {
    pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected',
    received: 'Received', processing: 'Processing',
    ready: 'Ready for Pickup', completed: 'Completed', cancelled: 'Cancelled',
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {labels[status] || status}
    </span>
  )
}

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 font-display">{value ?? '—'}</div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ── Update modal ─────────────────────────────────────────────────
function UpdateModal({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status)
  const [notes, setNotes] = useState('')
  const [altSlots, setAltSlots] = useState('')

  const statusOptions = [
    { value: 'confirmed',  label: '✅ Confirm Booking',         email: 'Sends confirmation email to customer' },
    { value: 'rejected',   label: '❌ Reject (Slot Unavailable)', email: 'Sends rejection + alternatives email' },
    { value: 'received',   label: '📦 Mark Items Received',      email: 'Sends "received, ready in 2-3 days" email' },
    { value: 'processing', label: '🔄 Mark Processing',          email: 'No email sent' },
    { value: 'ready',      label: '🎉 Mark Ready for Pickup',    email: 'Sends "clothes ready!" email to customer' },
    { value: 'completed',  label: '✔️ Mark Completed',           email: 'No email sent' },
    { value: 'cancelled',  label: '🚫 Cancel Booking',           email: 'No email sent' },
  ]

  const selectedOption = statusOptions.find(s => s.value === status)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up my-4">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Update Booking #{booking.order_number}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Customer: {booking.user_name} · {formatDate(booking.created_at)}
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Status picker */}
          <div>
            <label className="input-label">Update Status</label>
            <div className="space-y-2 mt-2">
              {statusOptions.map(opt => (
                <label key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    status === opt.value ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <input type="radio" name="status" value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="mt-0.5 accent-primary-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Alternative slots (show only for rejected) */}
          {status === 'rejected' && (
            <div>
              <label className="input-label">Suggest Alternative Slots</label>
              <input className="input" placeholder="e.g. Wed 29 Apr 9:00 AM, Thu 30 Apr 2:00 PM"
                value={altSlots} onChange={e => setAltSlots(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Comma separated — will appear in rejection email</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="input-label">Admin Notes (optional)</label>
            <textarea rows={2} className="input resize-none"
              placeholder="Internal notes for this booking..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost px-6">Cancel</button>
          <button
            onClick={() => onUpdate({ status, admin_notes: notes, alternative_slots: altSlots ? altSlots.split(',').map(s => s.trim()) : [] })}
            className="btn-primary px-6">
            Update & Send Email
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function StaffDashboardPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['staff-bookings'],
    queryFn: fetchAllBookings,
    refetchInterval: 30000, // auto-refresh every 30s
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: ({ id, status, admin_notes, alternative_slots }) =>
      updateStatus({ id, status, admin_notes, alternative_slots }),
    onSuccess: (data) => {
      toast.success(`Booking updated! ${data.message}`)
      qc.invalidateQueries(['staff-bookings'])
      setSelectedBooking(null)
    },
    onError: () => toast.error('Failed to update booking.'),
  })

  // Filter bookings
  const filtered = bookings.filter(b => {
    const matchTab = activeTab === 'all' || b.status === activeTab
    const matchSearch = !search ||
      b.order_number.toLowerCase().includes(search.toLowerCase()) ||
      b.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // Stats
  const stats = {
    total:      bookings.length,
    pending:    bookings.filter(b => b.status === 'pending').length,
    active:     bookings.filter(b => ['confirmed','received','processing'].includes(b.status)).length,
    ready:      bookings.filter(b => b.status === 'ready').length,
    completed:  bookings.filter(b => b.status === 'completed').length,
    revenue:    bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + Number(b.total_amount), 0),
  }

  const TABS = [
    { key: 'all',        label: 'All',         count: bookings.length },
    { key: 'pending',    label: 'Pending',      count: stats.pending },
    { key: 'confirmed',  label: 'Confirmed',    count: bookings.filter(b=>b.status==='confirmed').length },
    { key: 'received',   label: 'Received',     count: bookings.filter(b=>b.status==='received').length },
    { key: 'ready',      label: 'Ready',        count: stats.ready },
    { key: 'completed',  label: 'Completed',    count: stats.completed },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">local_laundry_service</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 font-display text-sm">LASU Viva Laundromat</div>
              <div className="text-xs text-primary-600 font-semibold">Staff Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">Auto-refreshes every 30s</div>
            <button onClick={() => qc.invalidateQueries(['staff-bookings'])}
              className="btn-ghost text-sm py-2">
              <span className="material-symbols-outlined text-base">refresh</span> Refresh
            </button>
            <a href="/" className="btn-ghost text-sm py-2">
              <span className="material-symbols-outlined text-base">logout</span> Exit
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon="receipt_long"  label="Total Bookings" value={stats.total}     color="bg-primary-600" />
          <StatCard icon="hourglass_empty" label="Pending"      value={stats.pending}   color="bg-amber-500" />
          <StatCard icon="autorenew"     label="Active"         value={stats.active}    color="bg-blue-500" />
          <StatCard icon="check_circle"  label="Ready"          value={stats.ready}     color="bg-emerald-500" />
          <StatCard icon="done_all"      label="Completed"      value={stats.completed} color="bg-slate-500" />
          <StatCard icon="payments"      label="Revenue (paid)" value={formatNaira(stats.revenue)} color="bg-violet-500" />
        </div>

        {/* Pending actions alert */}
        {stats.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">notifications_active</span>
            <div>
              <p className="font-bold text-amber-800">
                {stats.pending} booking{stats.pending > 1 ? 's' : ''} waiting for your review!
              </p>
              <p className="text-sm text-amber-600">
                Confirm or reject to send email notifications to customers.
              </p>
            </div>
            <button onClick={() => setActiveTab('pending')}
              className="ml-auto bg-amber-500 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors flex-shrink-0">
              Review Now →
            </button>
          </div>
        )}

        {/* Ready for pickup alert */}
        {stats.ready > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">local_laundry_service</span>
            <div>
              <p className="font-bold text-emerald-800">
                {stats.ready} order{stats.ready > 1 ? 's' : ''} ready for customer pickup!
              </p>
              <p className="text-sm text-emerald-600">Customers have been notified by email.</p>
            </div>
          </div>
        )}

        {/* Bookings table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display">Booking Management</h2>
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input className="input pl-9 py-2 text-sm" placeholder="Search order, name, email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-slate-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-3 text-sm font-semibold flex-shrink-0 border-b-2 transition-colors ${
                  activeTab === t.key ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading bookings...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-3">🧺</span>
              <p className="text-slate-500 font-medium">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Drop-off</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-primary-600 font-mono text-xs">#{b.order_number}</span>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDate(b.created_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{b.user_name}</div>
                        <div className="text-xs text-slate-400">{b.user_email}</div>
                        {b.user_phone && <div className="text-xs text-slate-400">{b.user_phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 font-medium">{b.service_name}</div>
                        <div className="text-xs text-slate-400">{b.items?.length || 0} items</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 font-medium">{b.scheduled_date}</div>
                        <div className="text-xs text-slate-400">{b.scheduled_time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${b.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {b.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                        <div className="text-xs text-slate-400 capitalize">{b.payment_method?.replace('_', ' ')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900">{formatNaira(b.total_amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedBooking(b)}
                          className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap">
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick reference */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-4 font-display">📧 Email Notification Guide</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { status: 'confirmed',  icon: '✅', label: 'Confirm Booking',   email: 'Customer gets: date, time, drop-off location' },
              { status: 'rejected',   icon: '❌', label: 'Reject Booking',    email: 'Customer gets: apology + alternative slots' },
              { status: 'received',   icon: '📦', label: 'Items Received',    email: 'Customer gets: "ready in 2-3 days" message' },
              { status: 'ready',      icon: '🎉', label: 'Ready for Pickup',  email: 'Customer gets: "clothes are ready!" alert' },
              { status: 'completed',  icon: '✔️', label: 'Mark Completed',    email: 'No email — booking archived' },
              { status: 'cancelled',  icon: '🚫', label: 'Cancel Booking',    email: 'No email — booking cancelled' },
            ].map(g => (
              <div key={g.status} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-sm text-slate-900 mb-1">{g.icon} {g.label}</div>
                <div className="text-xs text-slate-500">{g.email}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Update modal */}
      {selectedBooking && (
        <UpdateModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={(data) => doUpdate({ id: selectedBooking.id, ...data })}
        />
      )}
    </div>
  )
}