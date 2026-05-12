//BookingPage.jsx

import { useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay, getDay, isSameDay } from 'date-fns'
import { bookingService } from '../services/bookingService'
import { formatNaira } from '../utils/helpers'
import toast from 'react-hot-toast'

const CLOTHING_ITEMS = {
  Tops:      [{ id: 1, name: 'T-Shirt', price: 200, icon: '👕' }, { id: 2, name: 'Shirt', price: 350, icon: '👔' }, { id: 3, name: 'Blouse', price: 350, icon: '👗' }, { id: 4, name: 'Sweater', price: 500, icon: '🧥' }],
  Bottoms:   [{ id: 5, name: 'Jeans', price: 500, icon: '👖' }, { id: 6, name: 'Trousers', price: 450, icon: '👖' }, { id: 7, name: 'Shorts', price: 250, icon: '🩳' }],
  Dresses:   [{ id: 8, name: 'Dress', price: 700, icon: '👗' }, { id: 9, name: 'Gown', price: 900, icon: '👗' }],
  Outerwear: [{ id: 10, name: 'Jacket', price: 800, icon: '🧥' }, { id: 11, name: 'Coat', price: 1200, icon: '🥼' }],
  Others:    [{ id: 12, name: 'Bed Sheet', price: 600, icon: '🛏️' }, { id: 13, name: 'Towel', price: 300, icon: '⬜' }],
}

const TIME_SLOTS = ['08:00', '09:00', '11:00', '12:30', '14:00', '15:30', '17:00']
const SERVICE_FEE = 500

export default function BookingPage() {
  const { serviceId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const service = state?.service || { id: serviceId, name: 'Laundry Service', price: 800, price_unit: 'per_item' }

  const today = startOfDay(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [basket, setBasket] = useState({})
  const [activeCategory, setActiveCategory] = useState('Tops')

  // Calendar grid
  const calDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const leadingEmpty = Array(getDay(start)).fill(null)
    return [...leadingEmpty, ...days]
  }, [currentMonth])

  const addItem = id => setBasket(b => ({ ...b, [id]: (b[id] || 0) + 1 }))
  const removeItem = id => setBasket(b => { if (!b[id]) return b; const n = { ...b }; if (n[id] === 1) delete n[id]; else n[id]--; return n })
  const getQty = id => basket[id] || 0

  const basketItems = Object.entries(basket).map(([id, qty]) => {
    const item = Object.values(CLOTHING_ITEMS).flat().find(i => i.id === Number(id))
    return item ? { ...item, qty } : null
  }).filter(Boolean)

  const subtotal = basketItems.reduce((s, i) => s + i.price * i.qty, 0)
  const total = subtotal + SERVICE_FEE
  const totalQty = basketItems.reduce((s, i) => s + i.qty, 0)

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (data) => {
      toast.success('Booking created! Proceed to payment.')
      navigate(`/payment/${data.id}`, { state: { booking: data } })
    },
    onError: (err) => {
    console.log('FULL ERROR:', err.response?.data)
    const msg = JSON.stringify(err.response?.data)
    toast.error(msg || 'Could not create booking. Try again.')
},
  })

  const handleConfirm = () => {
    if (!selectedDay) return toast.error('Please select a drop-off date.')
    if (!selectedTime) return toast.error('Please select a time slot.')
    if (basketItems.length === 0) return toast.error('Please add at least one item.')
    
    const bookingData = {
      service_id: Number(service.id),
      scheduled_date: format(selectedDay, 'yyyy-MM-dd'),
      scheduled_time: selectedTime,
      payment_method: 'at_service',
      items: basketItems.map(i => ({ clothing_item_id: Number(i.id), quantity: i.qty })),
    }
    
    console.log('Sending booking data:', JSON.stringify(bookingData, null, 2))
    createBooking(bookingData)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Schedule Drop-off</h1>
        <p className="text-slate-500 mt-1">Select date, time, and items for <strong>{service.name}</strong></p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Calendar + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrentMonth(d => addDays(startOfMonth(d), -1))}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="text-lg font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth(d => addDays(endOfMonth(d), 1))}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />
                const past = isBefore(day, addDays(today, 1))
                const selected = selectedDay && isSameDay(day, selectedDay)
                return (
                  <button key={day.toISOString()}
                    onClick={() => !past && setSelectedDay(day)}
                    className={`cal-day text-sm font-medium
                      ${past ? 'cal-day-disabled' : ''}
                      ${selected ? 'cal-day-selected' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 p-3 bg-primary-50 rounded-xl border border-primary-100 text-sm text-slate-600">
              <span className="material-symbols-outlined text-primary-600">info</span>
              Same-day service is available for bookings made before 10:00 AM.
            </div>
          </div>

          {/* Time slots */}
          {selectedDay && (
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-1">Available Time Slots</h3>
              <p className="text-sm text-slate-500 mb-4">{format(selectedDay, 'EEEE, MMMM do')}</p>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2.5 text-sm font-semibold rounded-xl border transition-all
                      ${selectedTime === t
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-700 hover:border-primary-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item picker */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Select Items</h3>
            {/* Category tabs */}
            <div className="flex gap-1 mb-5 border-b border-slate-100 overflow-x-auto">
              {Object.keys(CLOTHING_ITEMS).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`pb-3 px-3 text-sm font-semibold flex-shrink-0 border-b-2 transition-colors ${
                    activeCategory === cat ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CLOTHING_ITEMS[activeCategory].map(item => {
                const qty = getQty(item.id)
                return (
                  <div key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${qty > 0 ? 'border-primary-300 bg-primary-50' : 'border-slate-200'}`}>
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-xs text-primary-600 font-semibold">{formatNaira(item.price)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors">−</button>
                      <span className="text-sm font-bold w-4 text-center">{qty}</span>
                      <button onClick={() => addItem(item.id)}
                        className="w-6 h-6 rounded-full bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center text-sm font-bold transition-colors">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right — Basket */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 font-display">Your Basket</h3>
              {totalQty > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{totalQty} items</span>
              )}
            </div>

            {basketItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl block mb-2">🛒</span>
                <p className="text-sm">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {basketItems.map(i => (
                  <div key={i.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-700">{i.qty}× {i.name}</span>
                    <span className="font-semibold">{formatNaira(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-semibold">{formatNaira(SERVICE_FEE)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-t-2 border-slate-200 mb-4">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-primary-600 font-display">{formatNaira(total)}</span>
            </div>

            {selectedDay && selectedTime && (
              <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold">{format(selectedDay, 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isPending || basketItems.length === 0 || !selectedDay || !selectedTime}
              className="btn-primary w-full py-3.5 justify-center disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <>Confirm Booking <span className="material-symbols-outlined">arrow_forward</span></>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">Next: choose your payment method</p>
          </div>
        </div>
      </div>
    </div>
  )
}
