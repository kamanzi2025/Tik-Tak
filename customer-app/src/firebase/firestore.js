import {
  collection, doc,
  addDoc, updateDoc,
  getDoc, getDocs,
  query, where, orderBy, limit,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import {
  localSubscribeRestaurants, localSubscribeRestaurant,
  localSubscribeMenu, localPlaceOrder,
  localSubscribeCustomerOrders, localSubscribeOrderByCode,
} from './localStore'

// ── Restaurants ────────────────────────────────────────────────────────────────

export function subscribeRestaurants(callback) {
  if (!isFirebaseConfigured) return localSubscribeRestaurants(callback)
  const q = query(collection(db, 'restaurants'), where('published', '==', true))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeRestaurant(restaurantId, callback) {
  if (!isFirebaseConfigured) return localSubscribeRestaurant(restaurantId, callback)
  return onSnapshot(doc(db, 'restaurants', restaurantId), (d) => {
    if (d.exists()) callback({ id: d.id, ...d.data() })
  })
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function subscribeMenu(restaurantId, callback) {
  if (!isFirebaseConfigured) return localSubscribeMenu(restaurantId, callback)
  const q = query(
    collection(db, 'menuItems'),
    where('restaurantId', '==', restaurantId),
    orderBy('category'),
    orderBy('name')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export async function placeOrder(orderData) {
  if (!isFirebaseConfigured) return localPlaceOrder(orderData)

  for (let i = 0; i < 5; i++) {
    const orderCode = 'TT-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    const collision = await getDocs(
      query(collection(db, 'orders'), where('orderCode', '==', orderCode), limit(1))
    )
    if (!collision.empty) continue
    const ref = await addDoc(collection(db, 'orders'), {
      ...orderData, orderCode, status: 'received', createdAt: serverTimestamp(),
    })
    return { id: ref.id, orderCode }
  }
  const orderCode = 'TT-' + Date.now().toString(36).slice(-4).toUpperCase()
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData, orderCode, status: 'received', createdAt: serverTimestamp(),
  })
  return { id: ref.id, orderCode }
}

export function subscribeCustomerOrders(customerId, callback) {
  if (!isFirebaseConfigured) return localSubscribeCustomerOrders(customerId, callback)
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeOrderByCode(orderCode, callback) {
  if (!isFirebaseConfigured) return localSubscribeOrderByCode(orderCode, callback)
  const q = query(
    collection(db, 'orders'),
    where('orderCode', '==', orderCode),
    limit(1)
  )
  return onSnapshot(q, (snap) => {
    if (snap.empty) callback(null)
    else callback({ id: snap.docs[0].id, ...snap.docs[0].data() })
  })
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function getUser(uid) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUser(uid, data) {
  if (!isFirebaseConfigured) return
  await updateDoc(doc(db, 'users', uid), data)
}
