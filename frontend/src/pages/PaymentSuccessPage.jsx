import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paymentService } from '../services/paymentService'
import { generateReceiptPDF } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reference) {
      paymentService.verifyPayment(reference)
        .then(data => { setBooking(data.booking); setLoading(false) })
        .catch(() => { toast.error('Payment verification failed.'); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [reference])

  const handleDownload = async () => {
    if (booking) await generateReceiptPDF(booking)
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Verifying your payment...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={handleDownload} disabled={!booking} className="btn-ghost text-sm">
          <span className="material-symbols-outlined text-base">download</span> PDF Receipt
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-primary-600 px-8 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Order Confirmed!</h2>
          <p className="text-primary-200 text-sm">Payment successful. Your order is ready for drop-off.</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Number</p>
            <h1 className="text-4xl font-bold text-primary-600 font-display">
              #{booking?.order_number || '—'}
            </h1>
          </div>

          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 mb-6 text-sm text-slate-600">
            <span className="font-bold text-primary-700 italic">Instructions: </span>
            Show this confirmation at the LASU Viva Laundromat counter when dropping off your laundry items.
          </div>

          {booking && (
            <div className="border-t border-dashed border-slate-200 pt-6">
              <div className="space-y-2.5 text-sm mb-4">
                {(booking.items || []).map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-slate-600">{item.quantity}× {item.clothing_item_name}</span>
                    <span className="font-semibold">₦{item.line_total}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="font-bold text-lg">Total Paid</span>
                <span className="text-xl font-bold text-primary-600">₦{booking.total_amount}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-8">
            <button onClick={handleDownload} disabled={!booking} className="btn-primary w-full py-3.5 justify-center">
              <span className="material-symbols-outlined">print</span> Download Receipt
            </button>
            <Link to="/bookings" className="btn-ghost w-full py-3.5 justify-center text-center">
              View My Bookings
            </Link>
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-600">location_on</span>
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-900">Drop-off Point</p>
            <p className="text-slate-500">LASU Viva Laundromat, Main Campus</p>
          </div>
        </div>
      </div>
    </div>
  )
}
