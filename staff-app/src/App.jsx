import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'
import { useRestaurantOrders } from './hooks/useOrders'
import { useAuth } from './hooks/useAuth'
import StaffBottomNav from './components/common/StaffBottomNav'
import LoadingSpinner from './components/common/LoadingSpinner'
import OfflineBanner from './components/common/OfflineBanner'
import Login from './pages/Login'
import Register from './pages/Register'
import LiveOrders from './pages/LiveOrders'
import StaffMenu from './pages/StaffMenu'
import RestaurantProfile from './pages/RestaurantProfile'
import Sales from './pages/Sales'
import StaffSettings from './pages/StaffSettings'

function StaffShell() {
  const { user } = useAuth()
  const { orders } = useRestaurantOrders(user?.restaurantId)
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('gg_sound') !== 'false'
  )
  const newOrderCount = orders.filter((o) => o.status === 'received').length

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto relative overflow-hidden">
      <OfflineBanner />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route index element={<LiveOrders soundEnabled={soundEnabled} />} />
          <Route path="menu" element={<StaffMenu />} />
          <Route path="profile" element={<RestaurantProfile />} />
          <Route path="sales" element={<Sales />} />
          <Route path="settings" element={<StaffSettings soundEnabled={soundEnabled} onSoundToggle={() => setSoundEnabled((p) => {
            const next = !p; localStorage.setItem('gg_sound', String(next)); return next
          })} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <StaffBottomNav newOrderCount={newOrderCount} />
    </div>
  )
}

function RequireStaff({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner color="#412402" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner color="#412402" />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
      <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
      <Route path="/*" element={<RequireStaff><StaffShell /></RequireStaff>} />
    </Routes>
  )
}
