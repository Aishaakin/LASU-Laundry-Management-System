// BookingDetailPage.jsx
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingService } from '../services/bookingService'
import { formatNaira, formatDate, getStatusConfig } from '../utils/helpers'
import { generateReceiptPDF } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id } = useParams()
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingDetail(id),
  })

  const handleDownload = async () => {
    try { await generateReceiptPDF(booking); toast.success('Receipt downloaded!') }
    catch { toast.error('Could not generate PDF.') }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!booking) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Booking not found.</p>
      <Link to="/bookings" className="btn-primary mt-4">Back to Bookings</Link>
    </div>
  )

  const s = getStatusConfig(booking.status)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/bookings" className="btn-ghost p-2.5"><span className="material-symbols-outlined">arrow_back</span></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Order #{booking.order_number}</h1>
          <span className={s.color}>{s.label}</span>
        </div>
        <button onClick={handleDownload} className="btn-ghost ml-auto text-sm">
          <span className="material-symbols-outlined text-sm">download</span> Receipt
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-slate-900 font-display">Booking Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Service', booking.service_name],
            ['Drop-off Date', booking.scheduled_date],
            ['Time Slot', booking.scheduled_time],
            ['Payment Method', booking.payment_method],
            ['Payment Status', booking.payment_status],
            ['Created', formatDate(booking.created_at)],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{k}</div>
              <div className="font-semibold text-slate-800 capitalize">{v || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-slate-900 font-display mb-4">Items</h2>
        <div className="space-y-2">
          {(booking.items || []).map(item => (
            <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span>{item.quantity}× {item.clothing_item_name}</span>
              <span className="font-semibold">{formatNaira(item.line_total)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm py-2 border-b border-slate-100">
            <span className="text-slate-500">Service Fee</span>
            <span>{formatNaira(booking.service_fee || 500)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span className="text-primary-600">{formatNaira(booking.total_amount)}</span>
          </div>
        </div>
      </div>

      {booking.status === 'ready' && (
        <div className="card p-5 bg-emerald-50 border-emerald-200 flex items-center gap-4">
          <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
          <div>
            <p className="font-bold text-emerald-800">Your clothes are ready!</p>
            <p className="text-sm text-emerald-600">Come pick up your order at LASU Viva Laundromat.</p>
          </div>
        </div>
      )}
    </div>
  )
}
