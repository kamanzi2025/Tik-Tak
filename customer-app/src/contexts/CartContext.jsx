import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurantName, setRestaurantName] = useState('')

  const totalCount = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  // Returns true if added; false if item is from a different restaurant (caller shows dialog)
  const addItem = useCallback((item, restaurant) => {
    if (restaurantId && restaurantId !== restaurant.id) return false

    if (!restaurantId) {
      setRestaurantId(restaurant.id)
      setRestaurantName(restaurant.name)
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id)
      if (existing) return prev.map((i) => i.itemId === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty: 1 }]
    })
    return true
  }, [restaurantId])

  const removeItem = useCallback((itemId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.itemId !== itemId)
      if (next.length === 0) { setRestaurantId(null); setRestaurantName('') }
      return next
    })
  }, [])

  const updateQty = useCallback((itemId, qty) => {
    if (qty < 1) { removeItem(itemId); return }
    setItems((prev) => prev.map((i) => i.itemId === itemId ? { ...i, qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([]); setRestaurantId(null); setRestaurantName('')
  }, [])

  return (
    <CartContext.Provider
      value={{ items, restaurantId, restaurantName, totalCount, subtotal, addItem, removeItem, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
