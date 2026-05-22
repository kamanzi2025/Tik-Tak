import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../hooks/useAuth'
import { placeOrder, subscribeRestaurant } from '../firebase/firestore'

const METHOD_CONFIG = {
  mtn:    { label: 'MTN Mobile Money', icon: '📱', tillKey: 'mtnTillNumber',    selectedCls: 'border-amber-300 bg-amber-50', titleCls: 'text-amber-800', dotCls: 'bg-amber-500' },
  airtel: { label: 'Airtel Money',     icon: '📱', tillKey: 'airtelTillNumber', selectedCls: 'border-red-300 bg-red-50',     titleCls: 'text-red-800',   dotCls: 'bg-red-500' },
  cash:   { label: 'Pay on Pickup',    icon: '💵', tillKey: null,               selectedCls: 'border-gray-300 bg-gray-50',   titleCls: 'text-gray-800',  dotCls: 'bg-gray-500' },
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const [restaurant, setRestaurant] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!restaurantId) return
    return subscribeRestaurant(restaurantId, setRestaurant)
  }, [restaurantId])

  // Default to first available method once restaurant data loads
  useEffect(() => {
    if (!restaurant) return
    const opts = restaurant.paymentOptions || {}
    if (opts.acceptsMTN) setPaymentMethod('mtn')
    else if (opts.acceptsAirtel) setPaymentMethod('airtel')
    else setPaymentMethod('cash')
  }, [restaurant])

  if (items.length === 0) {
    navigate('/cart', { replace: true }); return null
  }

  const opts = restaurant?.paymentOptions || {}
  const availableMethods = [
    ...(opts.acceptsMTN ? ['mtn'] : []),
    ...(opts.acceptsAirtel ? ['airtel'] : []),
    'cash',
  ]

  function validatePhone(raw) {
    const digits = raw.replace(/[\s\-]/g, '')
    return /^07\d{8}$/.test(digits) ? digits : null
  }

  async function handlePlaceOrder() {
    if (!user && !guestName.trim()) { setError('Please enter your name.'); return }
    if (!user) {
      const cleaned = validatePhone(guestPhone)
      if (!cleaned) { setError('Enter a valid phone number starting with 07 (10 digits).'); return }
    }
    setError(''); setPlacing(true)

    try {
      const customerName = user ? user.name : guestName.trim()
      const cleanPhone = user ? null : validatePhone(guestPhone)
      const { id, orderCode } = await placeOrder({
        restaurantId,
        restaurantName,
        customerId: user ? user.uid : null,
        customerName,
        guestPhone: cleanPhone,
        items,
        total: subtotal,
        paymentMethod,
        paymentStatus: 'unpaid',
        note: note.trim(),
      })

      if (!user) sessionStorage.setItem('gg_pending_order', orderCode)
      clearCart()
      navigate('/order-confirmed', { state: { orderCode, orderId: id, restaurantName } })
    } catch {
      setError('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        <p className="text-xs text-brand font-medium">{restaurantName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-4">
        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.itemId} className="flex justify-between text-sm text-gray-600 py-1">
              <span>{item.name} × {item.qty}</span>
              <span>{(item.price * item.qty).toLocaleString()} RWF</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span><span>{subtotal.toLocaleString()} RWF</span>
          </div>
        </div>

        {/* Guest info */}
        {!user && (
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Your Details</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="07X XXX XXX"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              <p className="text-xs text-gray-400 mt-1">For pickup notification only</p>
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">How to Pay</h3>

          {opts.paymentNote && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
              <p className="text-xs text-blue-700">{opts.paymentNote}</p>
            </div>
          )}

          <div className="space-y-2">
            {availableMethods.map((method) => {
              const cfg = METHOD_CONFIG[method]
              const selected = paymentMethod === method
              const tillNumber = cfg.tillKey ? opts[cfg.tillKey] : null
              return (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selected ? cfg.selectedCls : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${selected ? cfg.titleCls : 'text-gray-900'}`}>{cfg.label}</p>
                      {tillNumber ? (
                        <p className="text-xs text-gray-500 mt-0.5">Till: <span className="font-mono font-medium">{tillNumber}</span></p>
                      ) : method === 'cash' ? (
                        <p className="text-xs text-gray-500 mt-0.5">Pay when you collect your order</p>
                      ) : null}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? cfg.dotCls + ' border-transparent' : 'border-gray-300'}`}>
                      {selected && <span className="w-2 h-2 bg-white rounded-full block" />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Wait time */}
        <div className="bg-brand-light rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-brand font-semibold text-sm">Estimated Wait</p>
            <p className="text-gray-700 text-sm">15–20 minutes after accepting</p>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Note to Kitchen (optional)</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
            placeholder="Allergies, special requests…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-gray-100 pt-3 max-w-lg mx-auto">
        <button onClick={handlePlaceOrder} disabled={placing}
          className="w-full bg-brand text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
          {placing ? 'Placing Order…' : `Place Order · ${subtotal.toLocaleString()} RWF`}
        </button>
      </div>
    </div>
  )
}
