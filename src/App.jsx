import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/Login'
import CustomerApp from './pages/customer/CustomerApp'
import StaffApp from './pages/staff/StaffApp'
import LoadingSpinner from './components/common/LoadingSpinner'

function RootRedirect() {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'staff' ? '/staff' : '/customer'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
