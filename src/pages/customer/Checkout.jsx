import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../hooks/useAuth'
import { placeOrder } from '../../firebase/firestore'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('pickup')
  const [mobileProvider, setMobileProvider] = useState('mtn')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    navigate('/customer/cart', { replace: true })
    return null
  }

  async function handlePlaceOrder() {
    if (paymentMethod === 'mobile' && !phone.trim()) {
      setError('Please enter your mobile money number.')
      return
    }
    setError('')
    setPlacing(true)
    try {
      const orderId = await placeOrder({
        restaurantId,
        restaurantName,
        customerId: user.uid,
        customerName: user.name,
        items,
        total: subtotal,
        paymentMethod: paymentMethod === 'mobile' ? `${mobileProvider.toUpperCase()} ${phone}` : 'Pay on pickup',
        note: note.trim(),
      })
      clearCart()
      navigate('/customer/orders', { state: { newOrderId: orderId } })
    } catch (err) {
      setError('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        <p className="text-xs text-customer font-medium">{restaurantName}</p>
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
            <span>Total</span>
            <span>{subtotal.toLocaleString()} RWF</span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="pickup"
                checked={paymentMethod === 'pickup'}
                onChange={() => setPaymentMethod('pickup')}
                className="accent-customer"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Pay on Pickup</p>
                <p className="text-xs text-gray-500">Pay cash when you collect your order</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="mobile"
                checked={paymentMethod === 'mobile'}
                onChange={() => setPaymentMethod('mobile')}
                className="accent-customer"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Mobile Money</p>
                <p className="text-xs text-gray-500">MTN or Airtel Mobile Money</p>
              </div>
            </label>
          </div>

          {paymentMethod === 'mobile' && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                {['mtn', 'airtel'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setMobileProvider(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      mobileProvider === p ? 'bg-customer text-white border-customer' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {p === 'mtn' ? 'MTN' : 'Airtel'}
                  </button>
                ))}
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07X XXX XXX"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-customer"
              />
            </div>
          )}
        </div>

        {/* Estimated time */}
        <div className="bg-customer-light rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-customer font-semibold text-sm">Estimated Wait</p>
            <p className="text-gray-700 text-sm">15–20 minutes after accepting</p>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Note to Kitchen</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Allergies, special requests…"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-customer"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-gray-100 pt-3">
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full bg-customer text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60"
        >
          {placing ? 'Placing Order…' : `Place Order · ${subtotal.toLocaleString()} RWF`}
        </button>
      </div>
    </div>
  )
}
