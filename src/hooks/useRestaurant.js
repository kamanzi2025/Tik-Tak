import { useEffect, useState } from 'react'
import { subscribeRestaurants, subscribeRestaurant } from '../firebase/firestore'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeRestaurants((data) => {
      setRestaurants(data)
      setLoading(false)
    })
    return unsub
  }, [])

  return { restaurants, loading }
}

export function useRestaurant(restaurantId) {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = subscribeRestaurant(restaurantId, (data) => {
      setRestaurant(data)
      setLoading(false)
    })
    return unsub
  }, [restaurantId])

  return { restaurant, loading }
}
