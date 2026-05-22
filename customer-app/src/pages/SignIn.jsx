import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/common/Logo'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, enterGuestMode } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-14 pb-10">
      <button onClick={() => navigate(-1)} className="absolute top-5 left-4 p-2 text-gray-600">
        <BackIcon />
      </button>

      <div className="flex flex-col items-center mb-8">
        <Logo size={52} />
        <h2 className="mt-3 text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to see your order history</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="you@school.rw"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-brand text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/signup" className="text-brand font-semibold">Create one</Link>
        </p>

        <div className="border-t border-gray-100 pt-4">
          <button type="button" onClick={() => { enterGuestMode(); navigate('/home') }}
            className="w-full text-center text-sm text-gray-400">
            Continue as guest instead →
          </button>
        </div>
      </form>
    </div>
  )
}
