// PaymentPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { paymentService } from '../services/paymentService'
import { bookingService } from '../services/bookingService'
import { formatNaira } from '../utils/helpers'
import { usePaystackPayment } from 'react-paystack'
import toast from 'react-hot-toast'
import api from '../services/api'

const safeNum = (val, fallback = 0) => {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

export default function PaymentPage() {
  const { bookingId } = useParams()
  const { state }     = useLocation()
  const navigate      = useNavigate()
  const { user }      = useAuth()

  // ── Fallback: if location.state is missing (e.g. page refresh),
  //    fetch the booking directly from the API instead of showing NaN.
  const [booking, setBooking] = useState(state?.booking || null)
  const [loadingBooking, setLoadingBooking] = useState(!state?.booking)

  useEffect(() => {
    if (!state?.booking && bookingId) {
      bookingService.getBookingDetail(bookingId)
        .then(data => {
          console.log('Fetched booking fresh from API:', data)
          setBooking(data)
        })
        .catch(err => {
          console.error('Could not fetch booking:', err)
          toast.error('Could not load booking details.')
        })
        .finally(() => setLoadingBooking(false))
    } else {
      console.log('Using booking from navigation state:', state?.booking)
    }
  }, [bookingId])

  const [method,        setMethod]        = useState('card')
  const [promoCode,     setPromoCode]     = useState('')
  const [promoResult,   setPromoResult]   = useState(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [discount,      setDiscount]      = useState(0)

  // ── Diagnostic logging — remove after confirming the fix ───────
  useEffect(() => {
    if (booking) {
      console.log('🔍 booking object:', booking)
      console.log('🔍 typeof total_amount:', typeof booking.total_amount, '| value:', booking.total_amount)
      console.log('🔍 typeof subtotal:', typeof booking.subtotal, '| value:', booking.subtotal)
      console.log('🔍 typeof service_fee:', typeof booking.service_fee, '| value:', booking.service_fee)
      console.log('🔍 items:', booking.items)
    }
  }, [booking])

  // ── Compute every value independently and safely ───────────────
  const itemsTotal = (() => {
    if (!booking?.items || !Array.isArray(booking.items)) return 0
    return booking.items.reduce((sum, i) => {
      const lineTotal = safeNum(i.line_total, safeNum(i.unit_price) * safeNum(i.quantity))
      return sum + lineTotal
    }, 0)
  })()

  const serviceFee = safeNum(booking?.service_fee, 200)
  const computedSubtotal = itemsTotal + serviceFee
  const subtotal = safeNum(booking?.subtotal, computedSubtotal)
  const backendTotal = safeNum(booking?.total_amount, NaN)
  const total = Number.isFinite(backendTotal) ? backendTotal : subtotal
  const finalTotal = Math.max(0, safeNum(total, 0) - safeNum(discount, 0))

  // ── Paystack config ───────────────────────────────────────────
  const paystackConfig = {
    reference: `LAU-${bookingId}-${Date.now()}`,
    email:     user?.email || '',
    amount:    Math.round(safeNum(finalTotal, 0) * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_274e6ff9df706b42664328af4c5fbfc8b42e583a',
    currency:  'NGN',
    channels:  ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    metadata: {
      booking_id:   bookingId,
      order_number: booking?.order_number,
      custom_fields: [
        { display_name: 'Booking ID',    variable_name: 'booking_id',    value: bookingId },
        { display_name: 'Order Number',  variable_name: 'order_number',  value: booking?.order_number },
        { display_name: 'Customer Name', variable_name: 'customer_name', value: `${user?.first_name} ${user?.last_name}` },
      ],
    },
  }

  const { mutate: verifyPayment, isPending: verifying } = useMutation({
    mutationFn: (reference) => paymentService.verifyPayment(reference),
    onSuccess: (data) => {
      toast.success('Payment successful! 🎉')
      navigate('/payment/success', { state: { booking: data.booking } })
    },
    onError: () => toast.error('Payment verification failed. Contact support.'),
  })

  const onPaystackSuccess = (response) => {
    const toastId = toast.loading('Verifying payment...')
    verifyPayment(response.reference, { onSettled: () => toast.dismiss(toastId) })
  }

  const onPaystackClose = () =>
    toast('Payment cancelled. You can try again.', { icon: 'ℹ️' })

  const initializePayment = usePaystackPayment(paystackConfig)

  const { mutate: confirmAtService, isPending: confirming } = useMutation({
    mutationFn: () => paymentService.initiatePayment(bookingId, user.email, 0),
    onSuccess:  () => navigate(`/payment/pay-at-service/${bookingId}`, { state: { booking } }),
    onError:    () => toast.error('Could not confirm booking. Please try again.'),
  })

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setApplyingPromo(true)
    try {
      const res  = await api.post('/promos/validate/', { code: promoCode.trim().toUpperCase() })
      const data = res.data
      console.log('🔍 promo response:', data)

      let calc = 0
      const discountValue = safeNum(data.discount_value, 0)
      if (data.discount_type === 'percentage') {
        calc = Math.round((safeNum(total, 0) * discountValue) / 100)
      } else {
        calc = Math.min(discountValue, safeNum(total, 0))
      }
      calc = safeNum(calc, 0)

      setDiscount(calc)
      setPromoResult({
        valid:   true,
        message: `You save ₦${calc.toLocaleString()} on this order!`,
      })
      toast.success('Promo code applied! 🎉')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired promo code.'
      setPromoResult({ valid: false, error: msg })
      setDiscount(0)
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleSubmitPayment = () => {
    if (!Number.isFinite(finalTotal) || finalTotal <= 0) {
      toast.error('Could not determine order total. Please go back and try again.')
      return
    }
    if (method === 'card') {
      initializePayment({ onSuccess: onPaystackSuccess, onClose: onPaystackClose })
    } else {
      confirmAtService()
    }
  }

  if (loadingBooking) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">Booking not found.</p>
        <Link to="/bookings" className="btn-primary">Back to My Bookings</Link>
      </div>
    )
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

        {/* ── Left: Payment form ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5 font-display">Select Payment Method</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setMethod('card')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                  method === 'card'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined">credit_card</span>
                Credit Card or Transfer
              </button>
              <button
                onClick={() => setMethod('service')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                  method === 'service'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined">storefront</span>
                Pay at Service
              </button>
            </div>

            {method === 'card' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Accepted Payment Methods:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[9px] font-black leading-none">V</span>
                      </div>
                      <span className="text-xs font-bold text-green-700">VERVE</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex flex-shrink-0">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <div className="w-4 h-4 bg-orange-400 rounded-full -ml-2 opacity-90" />
                      </div>
                      <span className="text-xs font-bold text-red-700">MASTERCARD</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-5 h-5 bg-blue-700 rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-black italic leading-none">VISA</span>
                      </div>
                      <span className="text-xs font-bold text-blue-700">VISA</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a8c1a]/10 border border-[#1a8c1a]/30 rounded-lg">
                      <div className="w-5 h-5 bg-[#1a8c1a] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-[9px] leading-none">OP</span>
                      </div>
                      <span className="text-xs font-bold text-[#1a8c1a]">OPAY</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-5 h-5 bg-purple-600 rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>account_balance</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700">TRANSFER</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-5 h-5 bg-amber-500 rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>dialpad</span>
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
                    <li>Staff marks your order as paid ✅</li>
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
              <><span className="material-symbols-outlined">lock</span> Pay {formatNaira(finalTotal)} with Paystack</>
            ) : (
              <><span className="material-symbols-outlined">event_available</span> Confirm Booking (Pay at Service)</>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Your data is secured with 256-bit encryption
          </p>
        </div>

        {/* ── Right: Order summary ── */}
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
                <span className="font-semibold">{formatNaira(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Fee</span>
                <span className="font-semibold">{formatNaira(serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VAT</span>
                <span className="font-semibold">₦0</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-semibold">Promo Discount</span>
                  <span className="font-semibold">-{formatNaira(discount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 mt-3 border-t-2 border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-primary-600 font-display">{formatNaira(finalTotal)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="card p-4">
            <label className="input-label">Promo Code</label>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value); setPromoResult(null) }}
                className={`input flex-1 py-2 ${
                  promoResult?.valid         ? 'border-emerald-400' :
                  promoResult?.valid === false ? 'border-red-400'   : ''
                }`}
                placeholder="e.g. LASU01"
                disabled={promoResult?.valid}
              />
              <button
                onClick={handleApplyPromo}
                disabled={applyingPromo || !promoCode.trim() || promoResult?.valid}
                className="btn-ghost py-2 px-4 text-sm"
              >
                {applyingPromo ? (
                  <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin inline-block" />
                ) : promoResult?.valid ? '✅' : 'Apply'}
              </button>
            </div>

            {promoResult?.valid && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-700">Promo code applied! 🎉</p>
                  <p className="text-xs text-emerald-600">{promoResult.message}</p>
                </div>
                <button
                  onClick={() => { setPromoResult(null); setPromoCode(''); setDiscount(0) }}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}

            {promoResult?.valid === false && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-bold text-red-600">❌ {promoResult.error}</p>
              </div>
            )}
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
