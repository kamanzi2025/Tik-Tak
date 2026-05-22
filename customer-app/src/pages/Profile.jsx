import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await updateProfile({ name: name.trim() })
    setSaving(false); setEditing(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-brand px-4 pt-12 pb-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow">
            <span className="text-brand font-bold text-2xl">{initials}</span>
          </div>
          {editing ? (
            <div className="mt-3 flex gap-2 w-full max-w-[220px]">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-lg px-3 py-1.5 text-sm border border-white/50 bg-white/20 text-white placeholder-white/60 focus:outline-none" />
              <button onClick={handleSave} disabled={saving}
                className="bg-white text-brand rounded-lg px-3 py-1.5 text-xs font-bold">
                {saving ? '…' : 'Save'}
              </button>
            </div>
          ) : (
            <>
              <h2 className="mt-3 text-white font-bold text-lg">{user?.name}</h2>
              <button onClick={() => setEditing(true)} className="text-white/70 text-xs mt-0.5 underline">Edit name</button>
            </>
          )}
          <p className="text-white/60 text-xs mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          {[
            { label: 'Account type', value: 'Customer' },
            { label: 'School', value: 'Campus School' },
            { label: 'App version', value: 'v1.0.0' },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleSignOut} disabled={signingOut}
          className="w-full bg-red-50 text-red-600 rounded-2xl py-3.5 font-semibold text-sm border border-red-100">
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
