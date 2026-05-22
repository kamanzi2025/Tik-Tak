import {
  collection, doc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import {
  localSubscribeRestaurant, localUpdateRestaurant,
  localSubscribeMenu, localAddMenuItem, localUpdateMenuItem, localDeleteMenuItem,
  localSubscribeRestaurantOrders, localUpdateOrderStatus,
  localUpdateUser,
} from './localStore'

// ── Restaurants ────────────────────────────────────────────────────────────────

export function subscribeRestaurant(restaurantId, callback) {
  if (!isFirebaseConfigured) return localSubscribeRestaurant(restaurantId, callback)
  return onSnapshot(doc(db, 'restaurants', restaurantId), (d) => {
    if (d.exists()) callback({ id: d.id, ...d.data() })
  })
}

export async function updateRestaurant(restaurantId, data) {
  if (!isFirebaseConfigured) return localUpdateRestaurant(restaurantId, data)
  await updateDoc(doc(db, 'restaurants', restaurantId), data)
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function subscribeMenu(restaurantId, callback) {
  if (!isFirebaseConfigured) return localSubscribeMenu(restaurantId, callback)
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
  if (!isFirebaseConfigured) return localAddMenuItem(data)
  await addDoc(collection(db, 'menuItems'), { ...data, createdAt: serverTimestamp() })
}

export async function updateMenuItem(itemId, data) {
  if (!isFirebaseConfigured) return localUpdateMenuItem(itemId, data)
  await updateDoc(doc(db, 'menuItems', itemId), data)
}

export async function deleteMenuItem(itemId) {
  if (!isFirebaseConfigured) return localDeleteMenuItem(itemId)
  await deleteDoc(doc(db, 'menuItems', itemId))
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export function subscribeRestaurantOrders(restaurantId, callback) {
  if (!isFirebaseConfigured) return localSubscribeRestaurantOrders(restaurantId, callback)
  const q = query(
    collection(db, 'orders'),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  if (!isFirebaseConfigured) return localUpdateOrderStatus(orderId, status, extra)
  await updateDoc(doc(db, 'orders', orderId), { status, ...extra })
}

export async function updateUser(uid, data) {
  if (!isFirebaseConfigured) return localUpdateUser(uid, data)
  await updateDoc(doc(db, 'users', uid), data)
}
