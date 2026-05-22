// Demo-mode data layer — talks to the shared store server on port 3999.

const BASE = 'http://localhost:3999'

async function api(path, method = 'GET', body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

function onEvent(type, cb) {
  const es = new EventSource(`${BASE}/events`)
  es.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === type || msg.type === 'connected') cb()
  }
  es.onerror = () => es.close()
  return () => es.close()
}

// ── Customer Auth ──────────────────────────────────────────────────────────────

export function localGetCurrentCustomer() {
  try { return JSON.parse(sessionStorage.getItem('gg_customer_user') || 'null') } catch { return null }
}

export async function localSignUpCustomer(name, email, password) {
  const uid = 'cust-' + Date.now()
  const profile = { uid, name, email, password, role: 'customer' }
  const result = await api('/customers', 'POST', profile)
  if (result.error === 'email-already-in-use')
    throw Object.assign(new Error('Email already in use.'), { code: 'auth/email-already-in-use' })
  const { password: _, ...safe } = profile
  sessionStorage.setItem('gg_customer_user', JSON.stringify(safe))
  return safe
}

export async function localSignInCustomer(email, password) {
  const customers = await api('/customers')
  const customer = customers.find((c) => c.email === email && c.password === password)
  if (!customer) throw new Error('Invalid email or password.')
  const { password: _, ...safe } = customer
  sessionStorage.setItem('gg_customer_user', JSON.stringify(safe))
  return safe
}

export async function localLogoutCustomer() {
  sessionStorage.removeItem('gg_customer_user')
}

// ── Restaurants ────────────────────────────────────────────────────────────────

export function localSubscribeRestaurants(callback) {
  async function emit() {
    const list = await api('/restaurants?published=true')
    callback(list)
  }
  emit()
  return onEvent('restaurants', emit)
}

export function localSubscribeRestaurant(restaurantId, callback) {
  async function emit() {
    const r = await api(`/restaurants/${restaurantId}`)
    if (r) callback(r)
  }
  emit()
  return onEvent('restaurants', emit)
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function localSubscribeMenu(restaurantId, callback) {
  async function emit() {
    const items = await api(`/menu-items?restaurantId=${restaurantId}`)
    callback(items)
  }
  emit()
  return onEvent('menuItems', emit)
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export function localPlaceOrder(orderData) {
  const orderCode = 'TT-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  return api('/orders', 'POST', { orderCode, ...orderData, status: 'received' })
}

export function localSubscribeCustomerOrders(customerId, callback) {
  async function emit() {
    const orders = await api(`/orders?customerId=${customerId}`)
    callback(orders)
  }
  emit()
  return onEvent('orders', emit)
}

export function localSubscribeOrderByCode(orderCode, callback) {
  async function emit() {
    const orders = await api(`/orders?orderCode=${orderCode}`)
    callback(orders[0] || null)
  }
  emit()
  return onEvent('orders', emit)
}
