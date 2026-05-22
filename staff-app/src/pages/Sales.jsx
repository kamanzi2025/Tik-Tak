import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRestaurantOrders } from '../hooks/useOrders'
import LoadingSpinner from '../components/common/LoadingSpinner'

const FILTERS = ['Today', 'This Week', 'This Month']

function filterOrders(orders, filter) {
  const now = new Date()
  return orders.filter((o) => {
    if (!o.createdAt?.toDate) return false
    const d = o.createdAt.toDate()
    if (filter === 'Today') return d.toDateString() === now.toDateString()
    if (filter === 'This Week') { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w }
    if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })
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

const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-700', preparing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600',
  declined: 'bg-red-100 text-red-600',
}

export default function Sales() {
  const { user } = useAuth()
  const { orders, loading } = useRestaurantOrders(user?.restaurantId)
  const [filter, setFilter] = useState('Today')

  const filtered = useMemo(() => filterOrders(orders, filter), [orders, filter])

  const stats = useMemo(() => {
    const completed = filtered.filter((o) => o.status === 'completed')
    const declined = filtered.filter((o) => o.status === 'declined')
    const revenue = completed.reduce((s, o) => s + (o.total || 0), 0)
    const itemCounts = {}
    completed.forEach((o) => o.items?.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty
    }))
    const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const paymentCounts = { mtn: 0, airtel: 0, cash: 0 }
    filtered.forEach((o) => {
      if (o.paymentMethod === 'mtn') paymentCounts.mtn++
      else if (o.paymentMethod === 'airtel') paymentCounts.airtel++
      else paymentCounts.cash++
    })
    return { total: filtered.length, revenue, completed: completed.length, declined: declined.length, topItems, paymentCounts }
  }, [filtered])

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/50 text-xs">Analytics</p>
        <h1 className="text-white font-bold text-lg">Sales</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex gap-2 px-4 pt-4 pb-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${filter === f ? 'bg-staff text-white border-staff' : 'bg-white text-gray-600 border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Total Orders', value: stats.total, icon: '📋' },
            { label: 'Revenue (RWF)', value: stats.revenue.toLocaleString(), icon: '💰' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Declined', value: stats.declined, icon: '❌' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-4">
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Payment method breakdown */}
        {stats.total > 0 && (
          <div className="px-4 mt-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Payment Methods</h3>
              <div className="flex gap-2">
                {[
                  { key: 'mtn',    label: 'MTN',    cls: 'bg-amber-50 border-amber-200', textCls: 'text-amber-700', countCls: 'text-amber-800' },
                  { key: 'airtel', label: 'Airtel', cls: 'bg-red-50 border-red-200',     textCls: 'text-red-700',   countCls: 'text-red-800' },
                  { key: 'cash',   label: 'Cash',   cls: 'bg-gray-50 border-gray-200',   textCls: 'text-gray-600',  countCls: 'text-gray-800' },
                ].map(({ key, label, cls, textCls, countCls }) => (
                  <div key={key} className={`flex-1 border rounded-xl p-3 text-center ${cls}`}>
                    <p className={`text-xl font-bold ${countCls}`}>{stats.paymentCounts[key]}</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${textCls}`}>{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">Payment is verified at the counter</p>
            </div>
          </div>
        )}

        {/* Top items */}
        {stats.topItems.length > 0 && (
          <div className="px-4 mt-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Top Selling Items</h3>
              {stats.topItems.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-900">{name}</span>
                  <span className="text-sm font-semibold text-staff">{qty} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        {filtered.length > 0 && (
          <div className="px-4 mt-3 mb-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Recent Orders</h3>
              </div>
              {filtered.slice(0, 20).map((order) => (
                <div key={order.id} className="px-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderCode && <span className="font-mono text-xs text-gray-500 mr-1">{order.orderCode}</span>}
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {order.items?.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{order.total?.toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <span className="text-4xl">📊</span>
            <p className="mt-3 text-gray-500 text-sm">No orders in this period</p>
          </div>
        )}
      </div>
    </div>
  )
}
