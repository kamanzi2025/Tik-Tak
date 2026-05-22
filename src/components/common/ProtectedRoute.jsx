import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuthContext()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'staff' ? '/staff' : '/customer'} replace />
  }

  return children
}
