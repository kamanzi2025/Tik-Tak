import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerStaff } from '../firebase/auth'
import { useAuthContext } from '../contexts/AuthContext'
import Logo from '../components/common/Logo'

export default function Register() {
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthContext()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError(''); setLoading(true)
    try {
      const user = await registerStaff(restaurantName.trim(), email.trim(), password)
      setUser(user)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.')
      else setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-staff flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Logo size={72} />
          <h1 className="mt-4 text-3xl font-bold text-white">Grab &amp; Go</h1>
          <p className="mt-1 text-white/60 text-sm">Create Restaurant Account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
            <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required
              placeholder="e.g. Mama Africa Grill"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="staff@restaurant.rw"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-staff text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Restaurant Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-staff font-medium">Sign in</Link>
          </p>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">Staff access only · Grab &amp; Go v1.0</p>
      </div>
    </div>
  )
}
