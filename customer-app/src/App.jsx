import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'
import AppShell from './components/common/AppShell'
import LoadingSpinner from './components/common/LoadingSpinner'

// Pages
import Welcome from './pages/Welcome'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import RestaurantMenu from './pages/RestaurantMenu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmed from './pages/OrderConfirmed'
import Orders from './pages/Orders'
import TrackOrder from './pages/TrackOrder'
import Profile from './pages/Profile'

// Requires guest mode OR signed in (basic access)
function RequireAccess({ children }) {
  const { user, isGuest, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user && !isGuest) return <Navigate to="/" replace />
  return children
}

// Requires signed-in account
function RequireAuth({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

// Redirect to app if already have access
function PublicOnly({ children }) {
  const { user, isGuest, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (user || isGuest) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public-only routes (redirect if already in app) */}
      <Route path="/" element={<PublicOnly><Welcome /></PublicOnly>} />
      <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />
      <Route path="/signup" element={<SignUp />} />

      {/* Always accessible (no auth needed for guest tracking) */}
      <Route path="/track" element={
        <AppShell><TrackOrder /></AppShell>
      } />

      {/* Main app — requires guest or auth */}
      <Route path="/home" element={<RequireAccess><AppShell><Home /></AppShell></RequireAccess>} />
      <Route path="/restaurant/:restaurantId" element={<RequireAccess><AppShell><RestaurantMenu /></AppShell></RequireAccess>} />
      <Route path="/cart" element={<RequireAccess><AppShell><Cart /></AppShell></RequireAccess>} />
      <Route path="/checkout" element={<RequireAccess><AppShell><Checkout /></AppShell></RequireAccess>} />
      <Route path="/order-confirmed" element={<RequireAccess><AppShell><OrderConfirmed /></AppShell></RequireAccess>} />

      {/* Auth-only routes */}
      <Route path="/orders" element={<RequireAuth><AppShell><Orders /></AppShell></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><AppShell><Profile /></AppShell></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
