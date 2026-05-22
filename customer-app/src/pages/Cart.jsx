import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import CartItemRow from '../components/customer/CartItemRow'

export default function Cart() {
  const navigate = useNavigate()
  const { items, restaurantName, subtotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 pb-24">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">Browse restaurants and add items</p>
        <button onClick={() => navigate('/home')}
          className="mt-6 bg-brand text-white rounded-xl px-6 py-3 font-semibold text-sm">
          Browse Restaurants
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-xs text-brand font-medium">{restaurantName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-44">
        <div className="bg-white rounded-2xl shadow-sm mt-4 px-4 divide-y divide-gray-100">
          {items.map((item) => <CartItemRow key={item.itemId} item={item} />)}
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow-sm px-4 py-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{subtotal.toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 mt-2 pt-2 border-t border-gray-100">
            <span>Total</span><span>{subtotal.toLocaleString()} RWF</span>
          </div>
        </div>

        <button onClick={clearCart} className="mt-3 text-xs text-red-400 text-center w-full py-2">
          Clear cart
        </button>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white border-t border-gray-100 pt-3 max-w-lg mx-auto">
        <button onClick={() => navigate('/checkout')}
          className="w-full bg-brand text-white rounded-xl py-3.5 font-bold text-sm">
          Proceed to Checkout →
        </button>
      </div>
    </div>
  )
}
