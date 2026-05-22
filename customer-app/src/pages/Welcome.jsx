import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/common/Logo'

export default function Welcome() {
  const { enterGuestMode } = useAuth()
  const navigate = useNavigate()

  function handleGuest() {
    enterGuestMode()
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand-light via-white to-white">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <Logo size={80} />
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">Tik-Tak</h1>
          <p className="mt-1 text-gray-500 text-sm text-center">Order from 5 restaurants on campus.<br/>No waiting in line.</p>
        </div>

        {/* Primary action */}
        <button
          onClick={handleGuest}
          className="w-full bg-brand text-white rounded-2xl py-4 font-bold text-base shadow-md active:bg-brand-dark transition-colors"
        >
          Browse &amp; Order as Guest
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          No account needed — just pick, order, and show your code at pickup
        </p>

        {/* Secondary actions */}
        <div className="flex gap-4 mt-6 justify-center">
          <Link
            to="/signin"
            className="flex-1 border-2 border-brand text-brand rounded-2xl py-3 font-semibold text-sm text-center active:bg-brand-light"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex-1 border-2 border-gray-200 text-gray-700 rounded-2xl py-3 font-semibold text-sm text-center active:bg-gray-50"
          >
            Create Account
          </Link>
        </div>

        {/* Feature hints */}
        <div className="mt-10 space-y-3">
          {[
            { icon: '🏪', text: '5 restaurants, one app' },
            { icon: '⚡', text: 'Real-time order tracking' },
            { icon: '📱', text: 'Pay on pickup or Mobile Money' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-gray-500 text-sm">
              <span className="text-xl">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
