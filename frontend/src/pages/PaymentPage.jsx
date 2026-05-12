// PaymentPage.jsx
import { useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { paymentService } from '../services/paymentService'
import { formatNaira } from '../utils/helpers'
import { usePaystackPayment } from 'react-paystack'
import toast from 'react-hot-toast'

export default function PaymentPage() {
  const { bookingId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const booking = state?.booking
  const [method, setMethod] = useState('card')
  const [promoCode, setPromoCode] = useState('')

  const total = booking?.total_amount || 0
  const subtotal = booking?.subtotal || 0
  const serviceFee = booking?.service_fee || 500

  // Paystack config
  const paystackConfig = {
    reference: `LAU-${bookingId}-${Date.now()}`,
    email: user?.email || '',
    amount: Math.round(Number(total) * 100), // convert to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxx',
    currency: 'NGN',
    metadata: {
      booking_id: bookingId,
      order_number: booking?.order_number,
      custom_fields: [
        { display_name: 'Booking ID',    variable_name: 'booking_id',    value: bookingId },
        { display_name: 'Order Number',  variable_name: 'order_number',  value: booking?.order_number },
        { display_name: 'Customer Name', variable_name: 'customer_name', value: `${user?.first_name} ${user?.last_name}` },
      ]
    }
  }

  // Paystack verification after payment
  const { mutate: verifyPayment, isPending: verifying } = useMutation({
    mutationFn: (reference) => paymentService.verifyPayment(reference),
    onSuccess: (data) => {
      toast.success('Payment successful! 🎉')
      navigate('/payment/success', {
        state: { booking: data.booking }
      })
    },
    onError: () => {
      toast.error('Payment verification failed. Contact support.')
    },
  })

  // Paystack success callback
  const onPaystackSuccess = (response) => {
    toast.loading('Verifying payment...')
    verifyPayment(response.reference)
  }

  // Paystack close callback
  const onPaystackClose = () => {
    toast('Payment cancelled. You can try again.', { icon: 'ℹ️' })
  }

  const initializePayment = usePaystackPayment(paystackConfig)

  // Pay at service mutation
  const { mutate: confirmAtService, isPending: confirming } = useMutation({
    mutationFn: () => paymentService.initiatePayment(bookingId, user.email, 0),
    onSuccess: () => {
      navigate(`/payment/pay-at-service/${bookingId}`, { state: { booking } })
    },
    onError: () => toast.error('Could not confirm booking. Please try again.'),
  })

  const handleSubmitPayment = () => {
    if (method === 'card') {
      // Open Paystack popup
      initializePayment({
        onSuccess: onPaystackSuccess,
        onClose: onPaystackClose,
      })
    } else {
      confirmAtService()
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/bookings" className="btn-ghost p-2.5">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Secure Checkout</h1>
          <p className="text-slate-500 text-sm">Booking #{booking?.order_number || bookingId}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Payment form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5 font-display">Select Payment Method</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setMethod('card')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${method === 'card' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
              >
                <span className="material-symbols-outlined">credit_card</span>
                Credit Card or Transfer
              </button>
              <button
                onClick={() => setMethod('service')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${method === 'service' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
              >
                <span className="material-symbols-outlined">storefront</span>
                Pay at Service
              </button>
            </div>

            {method === 'card' ? (
              <div className="space-y-4">
               {/* Accepted cards */}
<div className="space-y-2">
  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
    Accepted Payment Methods:
  </span>
  <div className="flex flex-wrap gap-2">

    {/* Verve */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
      <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[9px] font-black leading-none">V</span>
      </div>
      <span className="text-xs font-bold text-green-700">VERVE</span>
    </div>

    {/* Mastercard */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex flex-shrink-0">
        <div className="w-4 h-4 bg-red-500 rounded-full" />
        <div className="w-4 h-4 bg-orange-400 rounded-full -ml-2 opacity-90" />
      </div>
      <span className="text-xs font-bold text-red-700">MASTERCARD</span>
    </div>

    {/* Visa */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="w-5 h-5 bg-blue-700 rounded-sm flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[8px] font-black italic leading-none">VISA</span>
      </div>
      <span className="text-xs font-bold text-blue-700">VISA</span>
    </div>

    {/* OPay */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a8c1a]/10 border border-[#1a8c1a]/30 rounded-lg">
      <div className="w-5 h-5 bg-[#1a8c1a] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-[9px] leading-none">OP</span>
      </div>
      <span className="text-xs font-bold text-[#1a8c1a]">OPAY</span>
    </div>

    {/* Bank Transfer */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="w-5 h-5 bg-purple-600 rounded-sm flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>
          account_balance
        </span>
      </div>
      <span className="text-xs font-bold text-purple-700">TRANSFER</span>
    </div>

    {/* USSD */}
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="w-5 h-5 bg-amber-500 rounded-sm flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>
          dialpad
        </span>
      </div>
      <span className="text-xs font-bold text-amber-700">USSD</span>
    </div>

  </div>
</div>

                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-600 flex-shrink-0">info</span>
                  <p className="text-sm text-slate-600">
                    A Paystack secure popup will open to complete your payment. Supports all Nigerian bank cards.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="material-symbols-outlined text-emerald-500">verified_user</span>
                    <span>256-bit SSL encrypted. Powered by <strong>Paystack</strong>.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-600 flex-shrink-0">info</span>
                <div className="text-sm text-slate-600">
                  <p className="font-semibold mb-2">How Pay at Service works:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-500">
                    <li>Your booking is confirmed with a unique ID</li>
                    <li>Download your receipt</li>
                    <li>Bring the payment to LASU Viva Laundromat center</li>
                    <li>Pay cash or bank transfer at the counter</li>
                    <li>The staff will marks your order as paid ✅</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmitPayment}
            disabled={verifying || confirming}
            className="btn-primary w-full py-4 text-base justify-center"
          >
            {(verifying || confirming) ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {verifying ? 'Verifying payment...' : 'Processing...'}
              </span>
            ) : method === 'card' ? (
              <><span className="material-symbols-outlined">lock</span> Pay {formatNaira(total)} with Paystack</>
            ) : (
              <><span className="material-symbols-outlined">event_available</span> Confirm Booking (Pay at Service)</>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Your data is secured with 256-bit encryption
          </p>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-4 font-display">Order Summary</h3>
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100 mb-4">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🧺</div>
              <div>
                <div className="font-bold text-slate-900">{booking?.service_name || 'Laundry Service'}</div>
                <div className="text-xs text-slate-500 mt-0.5">{booking?.items?.length || 0} items</div>
                <div className="text-xs text-primary-600 font-semibold mt-1">Ready in 2-3 days</div>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Items Total</span>
                <span className="font-semibold">{formatNaira(subtotal - serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Fee</span>
                <span className="font-semibold">{formatNaira(serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT</span>
                <span className="font-semibold">₦0</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 mt-3 border-t-2 border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-primary-600 font-display">{formatNaira(total)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="card p-4">
            <label className="input-label">Promo Code</label>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className="input flex-1 py-2"
                placeholder="LASU20"
              />
              <button className="btn-ghost py-2 px-4 text-sm">Apply</button>
            </div>
          </div>

          {/* Help */}
          <div className="card p-4 bg-primary-50 border-primary-200">
            <p className="text-sm font-semibold text-slate-700 mb-2">Need help?</p>
            <a href="mailto:help@lasuvivalaundromat.com.ng"
              className="flex items-center gap-2 text-primary-600 text-sm font-bold hover:underline">
              <span className="material-symbols-outlined text-base">support_agent</span>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}