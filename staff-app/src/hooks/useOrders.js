import { useEffect, useState } from 'react'
import { subscribeRestaurantOrders } from '../firebase/firestore'

export function useRestaurantOrders(restaurantId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = subscribeRestaurantOrders(restaurantId, (data) => {
      setOrders(data); setLoading(false)
    })
    return unsub
  }, [restaurantId])

  return { orders, loading }
}
