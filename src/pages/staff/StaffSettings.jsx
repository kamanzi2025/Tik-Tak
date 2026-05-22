import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../../firebase/auth'

export default function StaffSettings({ soundEnabled, onSoundToggle }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [changing, setChanging] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    setPwError('')
    setChanging(true)
    try {
      await changePassword(currentPw, newPw)
      setPwMsg('Password changed successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwError('Incorrect current password or too many attempts.')
    } finally {
      setChanging(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/60 text-xs">Account</p>
        <h1 className="text-white font-bold text-lg">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4 space-y-4">
        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Account</p>
          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">Staff · {user?.restaurantId}</p>
        </div>

        {/* Sound toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">New Order Sound</p>
            <p className="text-xs text-gray-500">Play a beep when a new order arrives</p>
          </div>
          <button
            onClick={onSoundToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-customer' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Change Password</p>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff"
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff"
            />
            {pwError && <p className="text-red-600 text-xs">{pwError}</p>}
            {pwMsg && <p className="text-green-600 text-xs">{pwMsg}</p>}
            <button
              type="submit"
              disabled={changing}
              className="w-full bg-staff text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {changing ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full bg-red-50 text-red-600 rounded-2xl py-3.5 font-semibold text-sm border border-red-100"
        >
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
