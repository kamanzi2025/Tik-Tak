import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useOrderByCode } from '../hooks/useOrders'
import OrderTracker from '../components/customer/OrderTracker'
import Logo from '../components/common/Logo'

const STATUS_LABELS = {
  received: 'Order Received',
  preparing: 'Kitchen is Preparing',
  ready: 'Ready for Pickup! 🎉',
  completed: 'Completed',
  declined: 'Order Declined',
}

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
}

export default function TrackOrder() {
  const location = useLocation()
  const [input, setInput] = useState(location.state?.prefillCode || '')
  const [activeCode, setActiveCode] = useState(location.state?.prefillCode || '')

  const { order, loading } = useOrderByCode(activeCode)

  function handleTrack(e) {
    e.preventDefault()
    const cleaned = input.trim().toUpperCase()
    setActiveCode(cleaned)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-brand px-4 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <Logo size={30} />
          <div>
            <h1 className="text-white font-bold text-base">Track Your Order</h1>
            <p className="text-white/70 text-xs">No login needed</p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="GG-XXXX"
            maxLength={7}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest focus:outline-none"
          />
          <button type="submit"
            className="bg-white/20 text-white rounded-xl px-4 py-2.5 text-sm font-semibold border border-white/30">
            Track
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {!activeCode && (
          <div className="text-center py-16">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 text-gray-500 text-sm">Enter your order code above</p>
            <p className="text-xs text-gray-400 mt-1">Your code was shown on the confirmation screen</p>
          </div>
        )}

        {activeCode && loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Searching…</div>
        )}

        {activeCode && !loading && order === null && (
          <div className="bg-red-50 rounded-2xl p-5 text-center">
            <span className="text-3xl">❓</span>
            <p className="mt-2 font-semibold text-red-700">Order not found</p>
            <p className="text-xs text-red-500 mt-1">Check the code and try again</p>
          </div>
        )}

        {activeCode && !loading && order && (
          <div className="space-y-4">
            {/* Status card */}
            <div className={`rounded-2xl p-5 text-center shadow-sm ${order.status === 'ready' ? 'bg-brand text-white' : 'bg-white'}`}>
              <p className={`text-xs font-medium mb-1 ${order.status === 'ready' ? 'text-white/80' : 'text-gray-500'}`}>
                Order {activeCode}
              </p>
              <p className={`text-xl font-bold ${order.status === 'ready' ? 'text-white' : 'text-gray-900'}`}>
                {STATUS_LABELS[order.status] || order.status}
              </p>
            </div>

            {/* Tracker */}
            {order.status !== 'declined' && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <OrderTracker status={order.status} />
              </div>
            )}

            {/* Order details */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="font-semibold text-gray-900 text-sm mb-3">Order Details</p>
              <p className="text-xs text-gray-500 mb-1">📍 {order.restaurantName}</p>
              {order.createdAt && (
                <p className="text-xs text-gray-500 mb-2">🕐 Ordered at {formatDate(order.createdAt)}</p>
              )}
              <div className="border-t border-gray-100 pt-2 space-y-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.qty}× {item.name}</span>
                    <span>{(item.price * item.qty).toLocaleString()} RWF</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-1 flex justify-between font-bold text-gray-900 text-sm">
                  <span>Total</span><span>{order.total?.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
