import { useParams, useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingService } from '../services/bookingService'
import { formatNaira, formatDate } from '../utils/helpers'
import { generateReceiptPDF } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PayAtServicePage() {
  const { bookingId } = useParams()
  const { state } = useLocation()

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingDetail(bookingId),
    initialData: state?.booking,
  })

  const handleDownloadPDF = async () => {
    try {
      await generateReceiptPDF(booking)
      toast.success('Receipt downloaded!')
    } catch {
      toast.error('Could not generate PDF. Try again.')
    }
  }

  if (!booking) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Header actions */}
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={handleDownloadPDF} className="btn-ghost text-sm">
          <span className="material-symbols-outlined text-base">download</span> PDF Receipt
        </button>
        <button onClick={() => navigator.share?.({ title: 'LASU Viva Booking', text: `Booking #${booking.order_number}` })}
          className="btn-ghost p-2.5">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        {/* Blue header */}
        <div className="bg-primary-600 px-8 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Booking Confirmed — Payment Pending</h2>
          <p className="text-primary-200 text-sm">Your booking is received. Please pay at the service counter.</p>
        </div>

        <div className="p-8">
          {/* Order number */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Number</p>
            <h1 className="text-4xl font-bold text-primary-600 font-display">#{booking.order_number}</h1>
          </div>

          {/* QR placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-40 h-40 border-4 border-slate-100 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📦</span>
              <span className="text-xs text-slate-400 font-semibold">QR Code</span>
              <span className="text-xs text-slate-300 font-mono">#{booking.order_number}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 mb-6 text-sm text-slate-600">
            <span className="font-bold text-primary-700 italic">Instructions: </span>
            Present this booking ID and pay at the LASU Viva Laundromat counter when dropping off your items.
          </div>

          {/* Order details */}
          <div className="border-t border-dashed border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Order Details</h3>
              <span className="text-sm text-slate-500">{formatDate(booking.created_at)}</span>
            </div>
            <div className="space-y-2.5 text-sm mb-4">
              {(booking.items || []).map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-slate-600">{item.quantity}× {item.clothing_item_name}</span>
                  <span className="font-semibold">{formatNaira(item.line_total)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-600">Service Fee</span>
                <span className="font-semibold">{formatNaira(booking.service_fee || 500)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-lg">Total Amount Due</span>
              <span className="text-xl font-bold text-primary-600 font-display">{formatNaira(booking.total_amount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-8">
            <button onClick={handleDownloadPDF} className="btn-primary w-full py-3.5 justify-center">
              <span className="material-symbols-outlined">print</span> Download / Print Receipt
            </button>
            <Link to="/dashboard" className="btn-ghost w-full py-3.5 justify-center text-center">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Drop-off info */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary-600">location_on</span>
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-900">Drop-off Point</p>
            <p className="text-slate-500">LASU Viva Laundromat, Main Campus, Lagos State University</p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Need help? Email <a href="mailto:help@lasuvivalaundromat.com.ng" className="text-primary-600 font-semibold">help@lasuvivalaundromat.com.ng</a>
      </p>
    </div>
  )
}
