import { useEffect, useState } from 'react'
import { subscribeCustomerOrders, subscribeRestaurantOrders } from '../firebase/firestore'

export function useCustomerOrders(customerId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customerId) return
    const unsub = subscribeCustomerOrders(customerId, (data) => {
      setOrders(data)
      setLoading(false)
    })
    return unsub
  }, [customerId])

  return { orders, loading }
}

export function useRestaurantOrders(restaurantId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = subscribeRestaurantOrders(restaurantId, (data) => {
      setOrders(data)
      setLoading(false)
    })
    return unsub
  }, [restaurantId])

  return { orders, loading }
}
