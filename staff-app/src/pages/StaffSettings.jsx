import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { changePassword, deleteAccount } from '../firebase/auth'

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

  // Delete account state
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePw, setDeletePw] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    setPwError(''); setChanging(true)
    try {
      await changePassword(currentPw, newPw)
      setPwMsg('Password changed successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch {
      setPwError('Incorrect current password or too many attempts.')
    } finally {
      setChanging(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true); await signOut(); navigate('/login', { replace: true })
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE (in capitals) to confirm.'); return
    }
    if (!deletePw) { setDeleteError('Enter your password to confirm.'); return }
    setDeleteError(''); setDeleting(true)
    try {
      await deleteAccount(deletePw)
      navigate('/login', { replace: true })
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError('Incorrect password.')
      } else {
        setDeleteError('Failed to delete account. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/50 text-xs">Account</p>
        <h1 className="text-white font-bold text-lg">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4 space-y-4">
        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Account</p>
          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">Restaurant: {user?.restaurantId}</p>
        </div>

        {/* Sound toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">New Order Sound</p>
            <p className="text-xs text-gray-500">Beep when a new order arrives</p>
          </div>
          <button onClick={onSoundToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-brand' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Change Password</p>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {[
              { value: currentPw, setter: setCurrentPw, placeholder: 'Current password' },
              { value: newPw, setter: setNewPw, placeholder: 'New password' },
              { value: confirmPw, setter: setConfirmPw, placeholder: 'Confirm new password' },
            ].map(({ value, setter, placeholder }) => (
              <input key={placeholder} type="password" value={value} onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
            ))}
            {pwError && <p className="text-red-600 text-xs">{pwError}</p>}
            {pwMsg && <p className="text-green-600 text-xs">{pwMsg}</p>}
            <button type="submit" disabled={changing}
              className="w-full bg-staff text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">
              {changing ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} disabled={signingOut}
          className="w-full bg-red-50 text-red-600 rounded-2xl py-3.5 font-semibold text-sm border border-red-100">
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>

        {/* Danger zone */}
        <div className="border border-red-200 rounded-2xl overflow-hidden">
          <button onClick={() => setShowDeleteZone((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-red-50 text-left">
            <div>
              <p className="text-sm font-semibold text-red-700">Delete Restaurant Account</p>
              <p className="text-xs text-red-400 mt-0.5">Permanently removes all data</p>
            </div>
            <span className={`text-red-400 text-xs transition-transform ${showDeleteZone ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showDeleteZone && (
            <div className="px-4 pb-4 pt-2 bg-white space-y-3">
              <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700 space-y-1">
                <p className="font-semibold">This will permanently delete:</p>
                <p>• Your restaurant profile</p>
                <p>• All menu items</p>
                <p>• Your staff login account</p>
                <p className="font-semibold mt-1">Orders are kept for record-keeping. This cannot be undone.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Your current password</label>
                <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>

              {deleteError && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{deleteError}</p>}

              <button onClick={handleDeleteAccount} disabled={deleting}
                className="w-full bg-red-600 text-white rounded-xl py-3 font-bold text-sm disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete Restaurant Account Permanently'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
