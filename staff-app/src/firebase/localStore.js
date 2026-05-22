// Demo-mode data layer — talks to the shared store server on port 3999.
// Keeps Firebase-shaped API (subscribe returns unsubscribe fn).

const BASE = 'http://localhost:3999'

async function api(path, method = 'GET', body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// SSE subscription — calls callback when server broadcasts a change of `type`
function onEvent(type, cb) {
  const es = new EventSource(`${BASE}/events`)
  es.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.type === type || msg.type === 'connected') cb()
  }
  es.onerror = () => es.close()
  return () => es.close()
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export function localGetCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('gg_staff_user') || 'null') } catch { return null }
}

export async function localRegisterStaff(restaurantName, email, password) {
  const restaurantId = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const uid = 'local-' + Date.now()
  const profile = { uid, email, name: `${restaurantName} Staff`, role: 'staff', restaurantId, password }

  const result = await api('/users', 'POST', profile)
  if (result.error === 'email-already-in-use')
    throw Object.assign(new Error('Email already in use.'), { code: 'auth/email-already-in-use' })

  await api('/restaurants', 'POST', {
    id: restaurantId, name: restaurantName, tagline: '', description: '',
    category: '', location: '', openingHours: '', phone: '',
    imageUrl: '', logoUrl: '', isOpen: false, published: false,
  })

  const { password: _, ...safe } = profile
  sessionStorage.setItem('gg_staff_user', JSON.stringify(safe))
  return safe
}

export async function localLoginStaff(email, password) {
  const users = await api('/users')
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials or not a staff account.')
  const { password: _, ...safe } = user
  sessionStorage.setItem('gg_staff_user', JSON.stringify(safe))
  return safe
}

export async function localLogoutStaff() {
  sessionStorage.removeItem('gg_staff_user')
}

export async function localUpdateUser(uid, data) {
  await api(`/users/${uid}`, 'PUT', data)
  const current = localGetCurrentUser()
  if (current?.uid === uid) {
    sessionStorage.setItem('gg_staff_user', JSON.stringify({ ...current, ...data }))
  }
}

// ── Restaurants ────────────────────────────────────────────────────────────────

export function localSubscribeRestaurant(restaurantId, callback) {
  async function emit() {
    const r = await api(`/restaurants/${restaurantId}`)
    if (r) callback(r)
  }
  emit()
  return onEvent('restaurants', emit)
}

export async function localUpdateRestaurant(restaurantId, data) {
  await api(`/restaurants/${restaurantId}`, 'PUT', data)
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

export async function localAddMenuItem(data) {
  await api('/menu-items', 'POST', data)
}

export async function localUpdateMenuItem(itemId, data) {
  await api(`/menu-items/${itemId}`, 'PUT', data)
}

export async function localDeleteMenuItem(itemId) {
  await api(`/menu-items/${itemId}`, 'DELETE')
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export function localSubscribeRestaurantOrders(restaurantId, callback) {
  async function emit() {
    const orders = await api(`/orders?restaurantId=${restaurantId}`)
    callback(orders)
  }
  emit()
  return onEvent('orders', emit)
}

export async function localUpdateOrderStatus(orderId, status, extra = {}) {
  await api(`/orders/${orderId}`, 'PUT', { status, ...extra })
}
