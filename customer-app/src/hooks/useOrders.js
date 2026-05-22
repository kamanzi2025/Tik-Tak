import { useEffect, useState } from 'react'
import { subscribeCustomerOrders, subscribeOrderByCode } from '../firebase/firestore'

export function useCustomerOrders(customerId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customerId) { setLoading(false); return }
    const unsub = subscribeCustomerOrders(customerId, (data) => {
      setOrders(data); setLoading(false)
    })
    return unsub
  }, [customerId])

  return { orders, loading }
}

export function useOrderByCode(orderCode) {
  const [order, setOrder] = useState(undefined) // undefined = not yet fetched, null = not found
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orderCode) return
    setLoading(true)
    const unsub = subscribeOrderByCode(orderCode, (data) => {
      setOrder(data); setLoading(false)
    })
    return unsub
  }, [orderCode])

  return { order, loading }
}
