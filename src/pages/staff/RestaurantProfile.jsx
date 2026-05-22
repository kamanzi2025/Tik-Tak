import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRestaurant } from '../../hooks/useRestaurant'
import { updateRestaurant } from '../../firebase/firestore'
import RestaurantPreviewCard from '../../components/staff/RestaurantPreviewCard'

export default function RestaurantProfile() {
  const { user } = useAuth()
  const { restaurant, loading } = useRestaurant(user?.restaurantId)

  const [form, setForm] = useState({
    name: '', tagline: '', description: '', category: '',
    location: '', openingHours: '', phone: '',
    imageUrl: '', logoUrl: '', isOpen: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        tagline: restaurant.tagline || '',
        description: restaurant.description || '',
        category: restaurant.category || '',
        location: restaurant.location || '',
        openingHours: restaurant.openingHours || '',
        phone: restaurant.phone || '',
        imageUrl: restaurant.imageUrl || '',
        logoUrl: restaurant.logoUrl || '',
        isOpen: restaurant.isOpen ?? true,
      })
    }
  }, [restaurant])

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await updateRestaurant(user.restaurantId, form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center pt-20">
      <div className="animate-spin w-8 h-8 border-4 border-staff border-t-transparent rounded-full" />
    </div>
  )

  const fields = [
    { key: 'name', label: 'Restaurant Name', placeholder: 'e.g. Mama Africa Grill' },
    { key: 'tagline', label: 'Tagline', placeholder: 'Short catchy description' },
    { key: 'description', label: 'Full Description', placeholder: 'Detailed description…', multiline: true },
    { key: 'category', label: 'Category', placeholder: 'e.g. Rwandan mains' },
    { key: 'location', label: 'Campus Location', placeholder: 'e.g. Block A, Ground Floor' },
    { key: 'openingHours', label: 'Opening Hours', placeholder: 'e.g. Mon–Fri 7am–5pm' },
    { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 0788 000 000' },
    { key: 'imageUrl', label: 'Banner Image URL', placeholder: 'https://…' },
    { key: 'logoUrl', label: 'Logo Image URL', placeholder: 'https://…' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/60 text-xs">Profile Editor</p>
        <h1 className="text-white font-bold text-lg">Restaurant Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-4">
        {/* Accept orders toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Accept Orders</p>
            <p className="text-xs text-gray-500">Customers see Open/Closed status instantly</p>
          </div>
          <button
            onClick={() => update('isOpen', !form.isOpen)}
            className={`relative w-12 h-7 rounded-full transition-colors ${form.isOpen ? 'bg-customer' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.isOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Form fields */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {fields.map(({ key, label, placeholder, multiline }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
              {multiline ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-staff"
                />
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff"
                />
              )}
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Card Preview</h3>
          <RestaurantPreviewCard form={form} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-gray-100 pt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-staff text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
