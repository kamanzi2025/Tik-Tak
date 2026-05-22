import { useState } from 'react'
import { updateOrderStatus, deleteOrder } from '../../firebase/firestore'

function timeAgo(ts) {
  if (!ts?.toDate) return ''
  const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function StaffOrderCard({ order }) {
  const [loading, setLoading] = useState(false)
  const [declining, setDeclining] = useState(false)

  async function advance() {
    setLoading(true)
    const next = { received: 'preparing', preparing: 'ready', ready: 'completed' }[order.status]
    if (next) await updateOrderStatus(order.id, next)
    setLoading(false)
  }

  async function decline() {
    setDeclining(true)
    await updateOrderStatus(order.id, 'declined')
    setDeclining(false)
  }

  const actionLabel = {
    received: 'Accept',
    preparing: 'Mark Ready',
    ready: 'Complete',
  }[order.status]

  const shortId = order.id.slice(-5).toUpperCase()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-bold text-gray-900">#{shortId}</span>
          <p className="text-xs text-gray-500">{order.customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
          <p className="text-sm font-bold text-staff">{order.total?.toLocaleString()} RWF</p>
        </div>
      </div>

      <div className="space-y-0.5 mb-3">
        {order.items?.map((item, i) => (
          <p key={i} className="text-xs text-gray-700">
            {item.qty}× {item.name}
          </p>
        ))}
        {order.note && (
          <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded px-2 py-1">📝 {order.note}</p>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-2">{order.paymentMethod}</p>

      <div className="flex gap-2">
        {order.status === 'received' && (
          <button
            onClick={decline}
            disabled={declining}
            className="flex-1 border border-red-300 text-red-500 rounded-lg py-2 text-xs font-semibold disabled:opacity-50"
          >
            {declining ? '…' : 'Decline'}
          </button>
        )}
        {actionLabel && (
          <button
            onClick={advance}
            disabled={loading}
            className="flex-1 bg-staff text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-50"
          >
            {loading ? '…' : actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
