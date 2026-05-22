import { useEffect, useState } from 'react'
import { subscribeRestaurant } from '../firebase/firestore'

export function useRestaurant(restaurantId) {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = subscribeRestaurant(restaurantId, (data) => {
      setRestaurant(data); setLoading(false)
    })
    return unsub
  }, [restaurantId])

  return { restaurant, loading }
}
