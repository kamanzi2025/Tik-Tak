import { useState } from 'react'
import { updateMenuItem } from '../../firebase/firestore'

export default function MenuItemRow({ item, onEdit }) {
  const [imgErr, setImgErr] = useState(false)

  async function toggleStock(e) {
    e.stopPropagation()
    await updateMenuItem(item.id, { inStock: !item.inStock })
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer" onClick={() => onEdit(item)}>
      {item.imageUrl && !imgErr
        ? <img src={item.imageUrl} alt={item.name} onError={() => setImgErr(true)} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🍴</div>
      }
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
        <p className="text-xs text-gray-500">{item.category} · {item.price?.toLocaleString()} RWF</p>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleStock}
          className={`relative w-11 h-6 rounded-full transition-colors ${item.inStock ? 'bg-brand' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  )
}
