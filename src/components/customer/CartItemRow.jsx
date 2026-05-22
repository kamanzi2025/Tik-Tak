import { useCart } from '../../contexts/CartContext'

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

export default function CartItemRow({ item }) {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
        <p className="text-xs text-gray-500">{item.price.toLocaleString()} RWF each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQty(item.itemId, item.qty - 1)}
          className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm active:bg-gray-100"
        >−</button>
        <span className="w-5 text-center font-semibold text-sm">{item.qty}</span>
        <button
          onClick={() => updateQty(item.itemId, item.qty + 1)}
          className="w-7 h-7 rounded-full bg-customer flex items-center justify-center text-white font-bold text-sm active:bg-customer-dark"
        >+</button>
      </div>

      <div className="text-right min-w-[60px]">
        <p className="font-semibold text-sm text-gray-900">{(item.price * item.qty).toLocaleString()}</p>
        <p className="text-[10px] text-gray-400">RWF</p>
      </div>

      <button
        onClick={() => removeItem(item.itemId)}
        className="text-red-400 active:text-red-600 p-1"
      >
        <TrashIcon />
      </button>
    </div>
  )
}
