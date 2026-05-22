import { useState } from 'react'
import { updateOrderStatus } from '../../firebase/firestore'

function timeAgo(ts) {
  if (!ts) return ''
  const ms = ts?.toDate ? ts.toDate().getTime() : (typeof ts === 'number' ? ts : ts?.seconds * 1000)
  if (!ms) return ''
  const diff = Math.floor((Date.now() - ms) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const NEXT_STATUS = { received: 'preparing', preparing: 'ready' }
const ACTION_LABEL = { received: 'Accept', preparing: 'Mark Ready' }

const PAYMENT_BADGE = {
  mtn:    { label: 'MTN',    cls: 'bg-amber-100 text-amber-700' },
  airtel: { label: 'Airtel', cls: 'bg-red-100 text-red-700' },
  cash:   { label: 'Cash',   cls: 'bg-gray-100 text-gray-600' },
}

export default function StaffOrderCard({ order }) {
  const [loading, setLoading] = useState(false)
  const [paidLoading, setPaidLoading] = useState(false)
  const [declining, setDeclining] = useState(false)
  const shortId = order.id?.slice(-5).toUpperCase()
  const payBadge = PAYMENT_BADGE[order.paymentMethod] || PAYMENT_BADGE.cash

  async function advance() {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setLoading(true)
    await updateOrderStatus(order.id, next)
    setLoading(false)
  }

  async function completeWithPayment() {
    setPaidLoading(true)
    await updateOrderStatus(order.id, 'completed', { paid: true })
    setPaidLoading(false)
  }

  async function decline() {
    setDeclining(true)
    await updateOrderStatus(order.id, 'declined')
    setDeclining(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-900">#{shortId}</span>
            {order.orderCode && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{order.orderCode}</span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${payBadge.cls}`}>
              {payBadge.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{timeAgo(order.createdAt)}</p>
          <p className="text-sm font-bold text-staff">{order.total?.toLocaleString()} RWF</p>
        </div>
      </div>

      <div className="space-y-0.5 mb-3">
        {order.items?.map((item, i) => (
          <p key={i} className="text-xs text-gray-700">{item.qty}× {item.name}</p>
        ))}
        {order.note && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1">📝 {order.note}</p>
        )}
      </div>

      {order.guestPhone && <p className="text-xs text-gray-400 mb-2">📞 {order.guestPhone}</p>}

      <div className="flex gap-2">
        {order.status === 'received' && (
          <button onClick={decline} disabled={declining}
            className="flex-1 border border-red-300 text-red-500 rounded-lg py-2 text-xs font-semibold disabled:opacity-50">
            {declining ? '…' : 'Decline'}
          </button>
        )}

        {/* Accept / Mark Ready */}
        {ACTION_LABEL[order.status] && (
          <button onClick={advance} disabled={loading}
            className="flex-1 bg-staff text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-50">
            {loading ? '…' : ACTION_LABEL[order.status]}
          </button>
        )}

        {/* Ready stage — two completion buttons */}
        {order.status === 'ready' && (
          <button onClick={completeWithPayment} disabled={paidLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-50">
            {paidLoading ? '…' : 'Payment Received'}
          </button>
        )}
      </div>
    </div>
  )
}
