import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCustomerOrders } from '../hooks/useOrders'
import { useCart } from '../contexts/CartContext'
import { useRestaurant } from '../hooks/useRestaurant'
import OrderTracker from '../components/customer/OrderTracker'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ACTIVE = ['received', 'preparing', 'ready']
const STATUS_LABELS = { received: 'Received', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', declined: 'Declined' }
const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-brand-light text-brand',
  completed: 'bg-gray-100 text-gray-500',
  declined: 'bg-red-100 text-red-600',
}

function formatDate(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const time = d.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
  if (dStart === todayStart) return `Today ${time}`
  if (dStart === todayStart - 86400000) return `Yesterday ${time}`
  return d.toLocaleDateString('en-RW', { day: 'numeric', month: 'short' }) + ' ' + time
}

function ActiveOrderCard({ order }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      {order.status === 'ready' && (
        <div className="bg-brand text-white rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
          <span>🎉</span><span className="text-sm font-semibold">Ready for pickup!</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{order.restaurantName}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
        </div>
        <div className="text-right ml-2">
          <p className="text-brand font-bold text-sm">{order.total?.toLocaleString()} RWF</p>
          <p className="text-[10px] font-mono text-gray-400">{order.orderCode}</p>
        </div>
      </div>
      <OrderTracker status={order.status} />
    </div>
  )
}

function PastOrderCard({ order }) {
  const navigate = useNavigate()
  const { restaurantId: cartRestId, addItem, clearCart } = useCart()
  const { restaurant } = useRestaurant(order.restaurantId)

  function handleReorder() {
    if (!restaurant) return
    // If cart has items from a different restaurant, clear it first
    if (cartRestId && cartRestId !== order.restaurantId) clearCart()
    order.items?.forEach((item) => {
      for (let i = 0; i < item.qty; i++) {
        addItem({ id: item.itemId, name: item.name, price: item.price }, restaurant)
      }
    })
    navigate('/cart')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{order.restaurantName}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <p className="font-bold text-sm text-gray-900">{order.total?.toLocaleString()} RWF</p>
        </div>
      </div>
      {order.status === 'completed' && (
        <button onClick={handleReorder}
          className="mt-3 w-full border border-brand text-brand rounded-lg py-2 text-xs font-semibold">
          Reorder
        </button>
      )}
    </div>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const { orders, loading } = useCustomerOrders(user?.uid)

  const active = orders.filter((o) => ACTIVE.includes(o.status))
  const past = orders.filter((o) => !ACTIVE.includes(o.status))

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        {active.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active</h2>
            <div className="space-y-3">{active.map((o) => <ActiveOrderCard key={o.id} order={o} />)}</div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Past Orders</h2>
            <div className="space-y-3">{past.map((o) => <PastOrderCard key={o.id} order={o} />)}</div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">📋</span>
            <p className="mt-3 text-gray-500 text-sm">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Your past and active orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
