// localStorage-based store used when Firebase is not yet configured.

const KEY = {
  users: 'gg_users',
  restaurants: 'gg_restaurants',
  menuItems: 'gg_menuItems',
  currentUser: 'gg_currentUser',
}

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

// Simple in-process pub/sub for real-time-like subscriptions
const subs = {}
function notify(channel) { (subs[channel] || []).forEach((cb) => cb()) }
function addSub(channel, cb) {
  subs[channel] = [...(subs[channel] || []), cb]
  return () => { subs[channel] = (subs[channel] || []).filter((f) => f !== cb) }
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export function localGetCurrentUser() {
  return read(KEY.currentUser, null)
}

export async function localRegisterStaff(restaurantName, email, password) {
  const users = read(KEY.users, [])
  if (users.find((u) => u.email === email)) throw Object.assign(new Error('Email already in use.'), { code: 'auth/email-already-in-use' })
  const uid = 'local-' + Date.now()
  const restaurantId = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const profile = { uid, email, name: `${restaurantName} Staff`, role: 'staff', restaurantId, password }
  write(KEY.users, [...users, profile])

  const restaurants = read(KEY.restaurants, {})
  restaurants[restaurantId] = {
    id: restaurantId, name: restaurantName, tagline: '', description: '',
    category: '', location: '', openingHours: '', phone: '',
    imageUrl: '', logoUrl: '', isOpen: false, published: false,
  }
  write(KEY.restaurants, restaurants)

  const { password: _, ...safe } = profile
  write(KEY.currentUser, safe)
  return safe
}

export async function localLoginStaff(email, password) {
  const users = read(KEY.users, [])
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials or not a staff account.')
  if (user.role !== 'staff') throw new Error('Not a staff account.')
  const { password: _, ...safe } = user
  write(KEY.currentUser, safe)
  return safe
}

export async function localLogoutStaff() {
  localStorage.removeItem(KEY.currentUser)
}

export async function localUpdateUser(uid, data) {
  const users = read(KEY.users, [])
  write(KEY.users, users.map((u) => u.uid === uid ? { ...u, ...data } : u))
  const current = read(KEY.currentUser, null)
  if (current?.uid === uid) write(KEY.currentUser, { ...current, ...data })
}

// ── Restaurants ────────────────────────────────────────────────────────────────

export function localSubscribeRestaurant(restaurantId, callback) {
  function emit() {
    const restaurants = read(KEY.restaurants, {})
    const r = restaurants[restaurantId]
    if (r) callback(r)
  }
  emit()
  return addSub(`restaurant:${restaurantId}`, emit)
}

export async function localUpdateRestaurant(restaurantId, data) {
  const restaurants = read(KEY.restaurants, {})
  restaurants[restaurantId] = { ...restaurants[restaurantId], ...data }
  write(KEY.restaurants, restaurants)
  notify(`restaurant:${restaurantId}`)
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

export function localSubscribeMenu(restaurantId, callback) {
  function emit() {
    const items = read(KEY.menuItems, [])
    callback(items.filter((i) => i.restaurantId === restaurantId))
  }
  emit()
  return addSub(`menu:${restaurantId}`, emit)
}

export async function localAddMenuItem(data) {
  const items = read(KEY.menuItems, [])
  const id = 'item-' + Date.now()
  write(KEY.menuItems, [...items, { id, ...data }])
  notify(`menu:${data.restaurantId}`)
}

export async function localUpdateMenuItem(itemId, data) {
  const items = read(KEY.menuItems, [])
  const updated = items.map((i) => i.id === itemId ? { ...i, ...data } : i)
  write(KEY.menuItems, updated)
  const item = updated.find((i) => i.id === itemId)
  if (item) notify(`menu:${item.restaurantId}`)
}

export async function localDeleteMenuItem(itemId) {
  const items = read(KEY.menuItems, [])
  const item = items.find((i) => i.id === itemId)
  write(KEY.menuItems, items.filter((i) => i.id !== itemId))
  if (item) notify(`menu:${item.restaurantId}`)
}
