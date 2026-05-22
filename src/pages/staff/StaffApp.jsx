import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useRestaurantOrders } from '../../hooks/useOrders'
import { useAuth } from '../../hooks/useAuth'
import StaffBottomNav from '../../components/common/StaffBottomNav'
import LiveOrders from './LiveOrders'
import StaffMenu from './StaffMenu'
import RestaurantProfile from './RestaurantProfile'
import Sales from './Sales'
import StaffSettings from './StaffSettings'

export default function StaffApp() {
  const { user } = useAuth()
  const { orders } = useRestaurantOrders(user?.restaurantId)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const newOrderCount = orders.filter((o) => o.status === 'received').length

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto relative overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route index element={<LiveOrders soundEnabled={soundEnabled} />} />
          <Route path="menu" element={<StaffMenu />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="sales" element={<Sales />} />
          <Route path="settings" element={<StaffSettings soundEnabled={soundEnabled} onSoundToggle={() => setSoundEnabled((p) => !p)} />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
      <StaffBottomNav newOrderCount={newOrderCount} />
    </div>
  )
}
