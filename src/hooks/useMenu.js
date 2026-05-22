import { useEffect, useState } from 'react'
import { subscribeMenu } from '../firebase/firestore'

export function useMenu(restaurantId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = subscribeMenu(restaurantId, (data) => {
      setItems(data)
      setLoading(false)
    })
    return unsub
  }, [restaurantId])

  const categories = ['All', ...new Set(items.map((i) => i.category))]

  return { items, categories, loading }
}
