import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/common/Logo'
import { isFirebaseConfigured } from '../firebase/config'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Invalid credentials or not a staff account.')
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
          <p className="mt-1 text-white/60 text-sm">Restaurant Portal</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="bg-amber-400/20 border border-amber-400/40 rounded-xl px-4 py-2.5 mb-4 text-center">
            <p className="text-amber-200 text-xs font-medium">Demo mode — data saved on this device only</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
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

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-staff text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-500">
            New restaurant?{' '}
            <Link to="/register" className="text-staff font-medium">Create an account</Link>
          </p>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">Staff access only · Grab &amp; Go v1.0</p>
      </div>
    </div>
  )
}
