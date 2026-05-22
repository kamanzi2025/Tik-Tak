import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRestaurant } from '../hooks/useRestaurant'
import { updateRestaurant } from '../firebase/firestore'
import RestaurantPreviewCard from '../components/staff/RestaurantPreviewCard'

const FIELDS = [
  { key: 'name', label: 'Restaurant Name', placeholder: 'e.g. Mama Africa Grill' },
  { key: 'tagline', label: 'Tagline', placeholder: 'Short catchy description' },
  { key: 'description', label: 'Full Description', placeholder: 'Detailed description…', multiline: true },
  { key: 'category', label: 'Category', placeholder: 'e.g. Rwandan mains' },
  { key: 'location', label: 'Campus Location', placeholder: 'e.g. Block A, Ground Floor' },
  { key: 'openingHours', label: 'Opening Hours', placeholder: 'e.g. Mon–Fri 7am–5pm' },
  { key: 'phone', label: 'Phone Number', placeholder: '0788 000 000' },
  { key: 'imageUrl', label: 'Banner Image URL', placeholder: 'https://…' },
  { key: 'logoUrl', label: 'Logo Image URL', placeholder: 'https://…' },
]

const DEFAULT_PAY = {
  acceptsMTN: false, mtnTillNumber: '',
  acceptsAirtel: false, airtelTillNumber: '',
  paymentNote: '',
}

function Toggle({ on, onToggle, color = 'bg-brand' }) {
  return (
    <button onClick={onToggle}
      className={`relative w-10 h-6 rounded-full transition-colors ${on ? color : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function RestaurantProfile() {
  const { user } = useAuth()
  const { restaurant, loading } = useRestaurant(user?.restaurantId)

  const [form, setForm] = useState({
    name: '', tagline: '', description: '', category: '',
    location: '', openingHours: '', phone: '',
    imageUrl: '', logoUrl: '', isOpen: true, published: false,
  })
  const [pay, setPay] = useState(DEFAULT_PAY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingPay, setSavingPay] = useState(false)
  const [savedPay, setSavedPay] = useState(false)
  const [payError, setPayError] = useState('')
  const [togglingOpen, setTogglingOpen] = useState(false)

  useEffect(() => {
    if (!restaurant) return
    setForm({
      name: restaurant.name || '', tagline: restaurant.tagline || '',
      description: restaurant.description || '', category: restaurant.category || '',
      location: restaurant.location || '', openingHours: restaurant.openingHours || '',
      phone: restaurant.phone || '', imageUrl: restaurant.imageUrl || '',
      logoUrl: restaurant.logoUrl || '', isOpen: restaurant.isOpen ?? true,
      published: restaurant.published ?? false,
    })
    const p = restaurant.paymentOptions || {}
    setPay({
      acceptsMTN: p.acceptsMTN ?? false,
      mtnTillNumber: p.mtnTillNumber || '',
      acceptsAirtel: p.acceptsAirtel ?? false,
      airtelTillNumber: p.airtelTillNumber || '',
      paymentNote: p.paymentNote || '',
    })
  }, [restaurant])

  function update(key, value) { setForm((p) => ({ ...p, [key]: value })) }
  function updatePay(key, value) { setPay((p) => ({ ...p, [key]: value })) }

  async function toggleOpen() {
    const next = !form.isOpen
    update('isOpen', next)
    setTogglingOpen(true)
    await updateRestaurant(user.restaurantId, { isOpen: next })
    setTogglingOpen(false)
  }

  async function handleSave() {
    setSaving(true)
    await updateRestaurant(user.restaurantId, form)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSavePayment() {
    if (pay.acceptsMTN && !pay.mtnTillNumber.trim()) {
      setPayError('Enter your MTN till number or disable MTN payments.'); return
    }
    if (pay.acceptsAirtel && !pay.airtelTillNumber.trim()) {
      setPayError('Enter your Airtel till number or disable Airtel payments.'); return
    }
    setPayError('')
    setSavingPay(true)
    await updateRestaurant(user.restaurantId, {
      paymentOptions: { ...pay, acceptsCash: true },
    })
    setSavingPay(false); setSavedPay(true)
    setTimeout(() => setSavedPay(false), 2500)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center pt-20">
      <div className="animate-spin w-8 h-8 border-4 border-staff border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/50 text-xs">Profile Editor</p>
        <h1 className="text-white font-bold text-lg">Restaurant Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-4">
        {/* Publish toggle — controls visibility on customer home page */}
        <div className={`rounded-2xl shadow-sm p-4 flex items-center justify-between ${form.published ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Visible to Customers</p>
            <p className="text-xs text-gray-500">
              {form.published ? 'Your restaurant appears on the customer app' : 'Hidden — set up your profile & menu first, then publish'}
            </p>
          </div>
          <Toggle on={form.published} onToggle={() => update('published', !form.published)} color="bg-green-500" />
        </div>

        {/* Accept orders toggle — saves immediately so customers see the change at once */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Accept Orders</p>
            <p className="text-xs text-gray-500">
              {togglingOpen ? 'Updating…' : form.isOpen ? 'Customers see your restaurant as Open' : 'Customers see your restaurant as Closed'}
            </p>
          </div>
          <Toggle on={form.isOpen} onToggle={toggleOpen} />
        </div>

        {/* Basic info fields */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          {FIELDS.map(({ key, label, placeholder, multiline }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
              {multiline ? (
                <textarea value={form[key]} onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-staff" />
              ) : (
                <input value={form[key]} onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
              )}
            </div>
          ))}
        </div>

        {/* Payment options */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Payment Options</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose which payment methods customers can select at checkout</p>
          </div>

          {/* Cash — always on */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💵</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Cash / Pay on Pickup</p>
              <p className="text-xs text-gray-500">Always enabled — customer pays at the counter</p>
            </div>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Always on</span>
          </div>

          {/* MTN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <p className="text-sm font-medium text-gray-900">MTN Mobile Money</p>
              </div>
              <Toggle on={pay.acceptsMTN} onToggle={() => updatePay('acceptsMTN', !pay.acceptsMTN)} color="bg-amber-500" />
            </div>
            {pay.acceptsMTN && (
              <input value={pay.mtnTillNumber}
                onChange={(e) => updatePay('mtnTillNumber', e.target.value)}
                placeholder="MTN till number shown to customers"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            )}
          </div>

          {/* Airtel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <p className="text-sm font-medium text-gray-900">Airtel Money</p>
              </div>
              <Toggle on={pay.acceptsAirtel} onToggle={() => updatePay('acceptsAirtel', !pay.acceptsAirtel)} color="bg-red-500" />
            </div>
            {pay.acceptsAirtel && (
              <input value={pay.airtelTillNumber}
                onChange={(e) => updatePay('airtelTillNumber', e.target.value)}
                placeholder="Airtel till number shown to customers"
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            )}
          </div>

          {/* Payment note */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Payment Note (optional)</label>
            <input value={pay.paymentNote}
              onChange={(e) => updatePay('paymentNote', e.target.value)}
              placeholder="e.g. Send payment before collecting your order"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>

          {payError && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{payError}</p>}
          <button onClick={handleSavePayment} disabled={savingPay}
            className="w-full bg-staff text-white rounded-xl py-3 font-bold text-sm disabled:opacity-60">
            {savingPay ? 'Saving…' : savedPay ? '✓ Payment settings saved!' : 'Save Payment Settings'}
          </button>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Card Preview</h3>
          <RestaurantPreviewCard form={form} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-gray-100 pt-3 max-w-lg mx-auto">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-staff text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
