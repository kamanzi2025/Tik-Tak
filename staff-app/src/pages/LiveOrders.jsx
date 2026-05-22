import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRestaurantOrders } from '../hooks/useOrders'
import { useRestaurant } from '../hooks/useRestaurant'
import StaffOrderCard from '../components/staff/StaffOrderCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880; osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

export default function LiveOrders({ soundEnabled }) {
  const { user } = useAuth()
  const { restaurant } = useRestaurant(user?.restaurantId)
  const { orders, loading } = useRestaurantOrders(user?.restaurantId)
  const prevIdsRef = useRef(new Set())

  useEffect(() => {
    const newOrders = orders.filter((o) => o.status === 'received')
    const newIds = new Set(newOrders.map((o) => o.id))
    const added = [...newIds].filter((id) => !prevIdsRef.current.has(id))
    if (added.length > 0 && prevIdsRef.current.size > 0 && soundEnabled) beep()
    prevIdsRef.current = newIds
  }, [orders, soundEnabled])

  const received = orders.filter((o) => o.status === 'received')
  const preparing = orders.filter((o) => o.status === 'preparing')
  const ready = orders.filter((o) => o.status === 'ready')

  if (loading) return <LoadingSpinner />

  const lanes = [
    { label: 'New', items: received, color: 'bg-red-50 border-red-200' },
    { label: 'Preparing', items: preparing, color: 'bg-amber-50 border-amber-200' },
    { label: 'Ready', items: ready, color: 'bg-green-50 border-green-200' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/50 text-xs">Live Orders</p>
        <h1 className="text-white font-bold text-lg leading-tight">{restaurant?.name || '…'}</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex overflow-x-auto h-full gap-3 p-4 pb-20 items-start">
          {lanes.map(({ label, items, color }) => (
            <div key={label} className={`flex-shrink-0 w-64 rounded-2xl border p-3 ${color}`}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-bold text-gray-800 text-sm">{label}</h2>
                {items.length > 0 && (
                  <span className="bg-gray-700 text-white text-[10px] font-bold rounded-full px-2 py-0.5">{items.length}</span>
                )}
              </div>
              {items.length === 0
                ? <p className="text-xs text-gray-400 text-center py-4">No orders</p>
                : <div className="space-y-3">{items.map((o) => <StaffOrderCard key={o.id} order={o} />)}</div>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
