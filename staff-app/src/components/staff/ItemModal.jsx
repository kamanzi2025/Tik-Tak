import { useState } from 'react'
import { addMenuItem, updateMenuItem, deleteMenuItem } from '../../firebase/firestore'

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ItemModal({ item, restaurantId, existingCategories, onClose }) {
  const isNew = !item
  const [form, setForm] = useState({
    name: item?.name || '', category: item?.category || '',
    price: item?.price?.toString() || '', description: item?.description || '',
    imageUrl: item?.imageUrl || '', inStock: item?.inStock ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) { setForm((p) => ({ ...p, [field]: value })) }

  const suggestions = existingCategories.filter((c) =>
    c.toLowerCase().includes(form.category.toLowerCase()) && c !== form.category && form.category.length > 0
  )

  async function handleSave() {
    if (!form.name.trim()) { setError('Item name is required.'); return }
    if (!form.category.trim()) { setError('Category is required.'); return }
    const price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price <= 0) {
      setError('Enter a valid price greater than 0.'); return
    }
    setError(''); setSaving(true)
    const data = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price,
      restaurantId,
    }
    if (isNew) await addMenuItem(data)
    else await updateMenuItem(item.id, data)
    setSaving(false); onClose()
  }

  async function handleDelete() {
    setDeleting(true); await deleteMenuItem(item.id); setDeleting(false); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">{isNew ? 'Add Item' : 'Edit Item'}</h2>
          <button onClick={onClose} className="text-gray-400 p-1"><CloseIcon /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {[
            { key: 'name', label: 'Item Name *', placeholder: 'e.g. Grilled Chicken' },
            { key: 'imageUrl', label: 'Image URL', placeholder: 'https://…' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
              <input value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
            </div>
          ))}

          <div className="relative">
            <label className="text-xs font-medium text-gray-600 block mb-1">Category *</label>
            <input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Mains"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
            {suggestions.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-200 rounded-xl mt-1 w-full shadow-lg">
                {suggestions.slice(0, 4).map((s) => (
                  <button key={s} onClick={() => update('category', s)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Price (RWF) *</label>
            <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="e.g. 2500" min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2}
              placeholder="Short description…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-staff" />
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-gray-700">In Stock</label>
            <button onClick={() => update('inStock', !form.inStock)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.inStock ? 'bg-brand' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {!isNew && (
            confirmDelete ? (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-sm text-red-700 font-medium mb-2">Delete this item?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-xs">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 bg-red-500 text-white rounded-lg py-2 text-xs font-semibold">
                    {deleting ? '…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-red-500 text-xs font-medium text-center w-full py-1">Delete Item</button>
            )
          )}
        </div>

        <div className="px-4 pb-6 pt-3 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-staff text-white rounded-xl py-3.5 font-bold text-sm disabled:opacity-60">
            {saving ? 'Saving…' : isNew ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
