import {
  collection, doc,
  addDoc, updateDoc,
  getDoc, getDocs,
  query, where, orderBy, limit,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

// ── Order code generator ───────────────────────────────────────────────────────

export function generateOrderCode() {
  return 'GG-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}

// ── Restaurants ────────────────────────────────────────────────────────────────

export function subscribeRestaurants(callback) {
  const q = query(collection(db, 'restaurants'), where('published', '==', true))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeRestaurant(restaurantId, callback) {
  return onSnapshot(doc(db, 'restaurants', restaurantId), (d) => {
    if (d.exists()) callback({ id: d.id, ...d.data() })
  })
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function subscribeMenu(restaurantId, callback) {
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
  // Try up to 5 codes before falling back to a timestamp-based suffix
  for (let i = 0; i < 5; i++) {
    const orderCode = generateOrderCode()
    const collision = await getDocs(
      query(collection(db, 'orders'), where('orderCode', '==', orderCode), limit(1))
    )
    if (!collision.empty) continue
    const ref = await addDoc(collection(db, 'orders'), {
      ...orderData, orderCode, status: 'received', createdAt: serverTimestamp(),
    })
    return { id: ref.id, orderCode }
  }
  // Fallback: append a timestamp segment to guarantee uniqueness
  const orderCode = 'GG-' + Date.now().toString(36).slice(-4).toUpperCase()
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData, orderCode, status: 'received', createdAt: serverTimestamp(),
  })
  return { id: ref.id, orderCode }
}

// Real-time orders for a signed-in customer
export function subscribeCustomerOrders(customerId, callback) {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

// Real-time single order lookup by order code (guest tracking — no auth needed)
export function subscribeOrderByCode(orderCode, callback) {
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
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}
