import { useCart } from '../../contexts/CartContext'

export default function MenuItemCard({ item, restaurant, onCrossRestaurant }) {
  const { addItem, restaurantId } = useCart()

  function handleAdd() {
    if (!item.inStock) return
    const result = addItem(item, restaurant)
    if (result === false) {
      onCrossRestaurant?.()
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex ${!item.inStock ? 'opacity-60' : ''}`}>
      <div className="flex-1 p-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h4>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="text-customer font-bold text-sm mt-1">{item.price.toLocaleString()} RWF</p>
        {!item.inStock && (
          <span className="text-xs text-red-500 font-medium">Out of stock</span>
        )}
      </div>

      <div className="flex flex-col items-center justify-between p-3 pl-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover mb-2" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-2 text-2xl">🍴</div>
        )}
        <button
          onClick={handleAdd}
          disabled={!item.inStock}
          className="w-16 bg-customer text-white rounded-lg py-1 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed active:bg-customer-dark transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  )
}
