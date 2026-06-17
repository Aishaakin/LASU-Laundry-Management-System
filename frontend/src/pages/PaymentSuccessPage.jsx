//PaymentSuccessPage.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { generateReceiptPDF } from '../utils/helpers'
import { formatNaira } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const { state } = useLocation()
  const booking = state?.booking || null

  const handleDownload = async () => {
    if (!booking) return toast.error('No booking data to download.')
    try {
      await generateReceiptPDF(booking)
      toast.success('Receipt downloaded!')
    } catch {
      toast.error('Could not generate PDF.')
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in py-8">
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={handleDownload} disabled={!booking} className="btn-ghost text-sm">
          <span className="material-symbols-outlined text-base">download</span>
          PDF Receipt
        </button>
      </div>

      <div className="card overflow-hidden">
        {/* Success header */}
        <div className="bg-primary-600 px-8 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Payment Successful! 🎉</h2>
          <p className="text-primary-200 text-sm">Your order is confirmed and ready for drop-off.</p>
        </div>

        <div className="p-8">
          {/* Order number */}
          <div className="text-center mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Number</p>
            <h1 className="text-4xl font-bold text-primary-600 font-display">
              #{booking?.order_number || '—'}
            </h1>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 mb-6 text-sm text-slate-600">
            <span className="font-bold text-primary-700">Instructions: </span>
            Show this confirmation at the LASU Viva Laundromat counter when dropping off your items.
          </div>

          {/* Payment badge */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-6">
            <span className="material-symbols-outlined text-emerald-600">verified</span>
            <div>
              <p className="text-sm font-bold text-emerald-800">Payment Confirmed via Paystack</p>
              <p className="text-xs text-emerald-600">No payment needed at counter</p>
            </div>
          </div>

          {/* Order items */}
          {booking && (
            <div className="border-t border-dashed border-slate-200 pt-6 mb-6">
              <h3 className="font-bold text-slate-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {(booking.items || []).map(item => (
                  <div key={item.id} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">{item.quantity}× {item.clothing_item_name}</span>
                    <span className="font-semibold">{formatNaira(item.line_total)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Service Fee</span>
                  <span>{formatNaira(booking.service_fee || 500)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Total Paid</span>
                <span className="text-xl font-bold text-primary-600 font-display">
                  {formatNaira(booking.total_amount)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              disabled={!booking}
              className="btn-primary w-full py-3.5 justify-center"
            >
              <span className="material-symbols-outlined">print</span>
              Download Receipt
            </button>
            <Link to="/bookings" className="btn-ghost w-full py-3.5 justify-center text-center">
              View My Bookings
            </Link>
            <Link
              to="/dashboard"
              className="text-center text-sm text-slate-400 hover:text-slate-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Drop-off info */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
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
        Need help?{' '}
        <a href="mailto:help@lasuvivalaundromat.com.ng" className="text-primary-600 font-semibold hover:underline">
          help@lasuvivalaundromat.com.ng
        </a>
      </p>
    </div>
  )
}
