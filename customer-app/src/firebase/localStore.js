// Reads from the same localStorage keys written by the staff app.
// Uses the `storage` event so changes in the staff app tab instantly
// trigger callbacks in this (customer) tab.

const KEY = {
  restaurants: 'gg_restaurants',
  menuItems: 'gg_menuItems',
  orders: 'gg_orders',
}

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

function listenStorage(targetKey, cb) {
  function handler(e) { if (!targetKey || e.key === targetKey) cb() }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

// ── Restaurants ────────────────────────────────────────────────────────────────

export function localSubscribeRestaurants(callback) {
  function emit() {
    const map = read(KEY.restaurants, {})
    callback(Object.values(map).filter((r) => r.published))
  }
  emit()
  return listenStorage(KEY.restaurants, emit)
}

export function localSubscribeRestaurant(restaurantId, callback) {
  function emit() {
    const map = read(KEY.restaurants, {})
    const r = map[restaurantId]
    if (r) callback(r)
  }
  emit()
  return listenStorage(KEY.restaurants, emit)
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function localSubscribeMenu(restaurantId, callback) {
  function emit() {
    const items = read(KEY.menuItems, [])
    callback(items.filter((i) => i.restaurantId === restaurantId))
  }
  emit()
  return listenStorage(KEY.menuItems, emit)
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export function localPlaceOrder(orderData) {
  const orders = read(KEY.orders, [])
  const orderCode = 'GG-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  const id = 'order-' + Date.now()
  const order = { id, orderCode, ...orderData, status: 'received', createdAt: Date.now() }
  write(KEY.orders, [...orders, order])
  return { id, orderCode }
}

export function localSubscribeCustomerOrders(customerId, callback) {
  function emit() {
    const orders = read(KEY.orders, [])
    callback(orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt - a.createdAt))
  }
  emit()
  return listenStorage(KEY.orders, emit)
}

export function localSubscribeOrderByCode(orderCode, callback) {
  function emit() {
    const orders = read(KEY.orders, [])
    callback(orders.find((o) => o.orderCode === orderCode) || null)
  }
  emit()
  return listenStorage(KEY.orders, emit)
}
