import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMenu } from '../hooks/useMenu'
import MenuItemRow from '../components/staff/MenuItemRow'
import ItemModal from '../components/staff/ItemModal'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-6 h-6">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export default function StaffMenu() {
  const { user } = useAuth()
  const { items, categories, loading } = useMenu(user?.restaurantId)
  const [modalItem, setModalItem] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const grouped = categories.map((cat) => ({
    cat, items: items.filter((i) => i.category === cat),
  }))

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      <div className="bg-staff px-4 pt-12 pb-4">
        <p className="text-white/50 text-xs">Menu Management</p>
        <h1 className="text-white font-bold text-lg">Menu Items</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        {grouped.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">🍴</span>
            <p className="text-gray-500 text-sm mt-2">No items yet. Tap + to add your first item.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ cat, items: catItems }) => (
              <div key={cat} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat}</h3>
                </div>
                <div className="px-4">
                  {catItems.map((item) => <MenuItemRow key={item.id} item={item} onEdit={setModalItem} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-staff rounded-full shadow-lg flex items-center justify-center text-white z-40">
        <PlusIcon />
      </button>

      {(showAdd || modalItem) && (
        <ItemModal item={modalItem} restaurantId={user?.restaurantId}
          existingCategories={categories}
          onClose={() => { setModalItem(null); setShowAdd(false) }} />
      )}
    </div>
  )
}
