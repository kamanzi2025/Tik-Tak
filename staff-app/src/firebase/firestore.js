import {
  collection, doc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

// ── Restaurants ────────────────────────────────────────────────────────────────

export function subscribeRestaurant(restaurantId, callback) {
  return onSnapshot(doc(db, 'restaurants', restaurantId), (d) => {
    if (d.exists()) callback({ id: d.id, ...d.data() })
  })
}

export async function updateRestaurant(restaurantId, data) {
  await updateDoc(doc(db, 'restaurants', restaurantId), data)
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function subscribeMenu(restaurantId, callback) {
  const q = query(
    collection(db, 'menuItems'),
    where('restaurantId', '==', restaurantId),
    orderBy('category'), orderBy('name')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function addMenuItem(data) {
  await addDoc(collection(db, 'menuItems'), { ...data, createdAt: serverTimestamp() })
}

export async function updateMenuItem(itemId, data) {
  await updateDoc(doc(db, 'menuItems', itemId), data)
}

export async function deleteMenuItem(itemId) {
  await deleteDoc(doc(db, 'menuItems', itemId))
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export function subscribeRestaurantOrders(restaurantId, callback) {
  const q = query(
    collection(db, 'orders'),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, 'orders', orderId), { status })
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}
