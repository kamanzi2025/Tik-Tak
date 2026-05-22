// Minimal shared data server for demo mode (no external dependencies).
// Runs on port 3999. Both apps (3000 + 3001) use this instead of localStorage.
// Data is persisted to data.json so it survives server restarts.

import { createServer } from 'http'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dir, 'data.json')
const PORT = 3999

let db = { restaurants: {}, menuItems: [], orders: [], users: [], customers: [] }
if (existsSync(DATA_FILE)) {
  try { db = JSON.parse(readFileSync(DATA_FILE, 'utf8')) } catch {}
}

const sseClients = new Set()

function save() {
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
}

function broadcast(type) {
  const msg = `data: ${JSON.stringify({ type })}\n\n`
  sseClients.forEach((res) => { try { res.write(msg) } catch {} })
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function json(res, data, status = 200) {
  cors(res)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function body(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', () => { try { resolve(JSON.parse(raw)) } catch { resolve({}) } })
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method

  if (method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return }

  // SSE — real-time updates
  if (path === '/events') {
    cors(res)
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
    res.write('data: {"type":"connected"}\n\n')
    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }

  // Restaurants
  if (path === '/restaurants' && method === 'GET') {
    const onlyPublished = url.searchParams.get('published') === 'true'
    const list = Object.values(db.restaurants)
    return json(res, onlyPublished ? list.filter((r) => r.published) : list)
  }
  if (path.startsWith('/restaurants/') && method === 'GET') {
    const id = path.split('/')[2]
    return json(res, db.restaurants[id] || null)
  }
  if (path.startsWith('/restaurants/') && method === 'PUT') {
    const id = path.split('/')[2]
    const data = await body(req)
    db.restaurants[id] = { ...db.restaurants[id], ...data }
    save(); broadcast('restaurants')
    return json(res, db.restaurants[id])
  }
  if (path === '/restaurants' && method === 'POST') {
    const data = await body(req)
    db.restaurants[data.id] = data
    save(); broadcast('restaurants')
    return json(res, data)
  }

  // Menu items
  if (path === '/menu-items' && method === 'GET') {
    const rid = url.searchParams.get('restaurantId')
    return json(res, rid ? db.menuItems.filter((i) => i.restaurantId === rid) : db.menuItems)
  }
  if (path === '/menu-items' && method === 'POST') {
    const data = await body(req)
    const item = { id: 'item-' + Date.now(), ...data }
    db.menuItems.push(item)
    save(); broadcast('menuItems')
    return json(res, item)
  }
  if (path.startsWith('/menu-items/') && method === 'PUT') {
    const id = path.split('/')[2]
    const updates = await body(req)
    db.menuItems = db.menuItems.map((i) => i.id === id ? { ...i, ...updates } : i)
    save(); broadcast('menuItems')
    return json(res, db.menuItems.find((i) => i.id === id))
  }
  if (path.startsWith('/menu-items/') && method === 'DELETE') {
    const id = path.split('/')[2]
    db.menuItems = db.menuItems.filter((i) => i.id !== id)
    save(); broadcast('menuItems')
    return json(res, { ok: true })
  }

  // Orders
  if (path === '/orders' && method === 'GET') {
    const rid = url.searchParams.get('restaurantId')
    const cid = url.searchParams.get('customerId')
    const code = url.searchParams.get('orderCode')
    let list = db.orders
    if (rid) list = list.filter((o) => o.restaurantId === rid)
    if (cid) list = list.filter((o) => o.customerId === cid)
    if (code) list = list.filter((o) => o.orderCode === code)
    return json(res, list.sort((a, b) => b.createdAt - a.createdAt))
  }
  if (path === '/orders' && method === 'POST') {
    const data = await body(req)
    const order = { id: 'order-' + Date.now(), ...data, createdAt: Date.now() }
    db.orders.push(order)
    save(); broadcast('orders')
    return json(res, order)
  }
  if (path.startsWith('/orders/') && method === 'PUT') {
    const id = path.split('/')[2]
    const updates = await body(req)
    db.orders = db.orders.map((o) => o.id === id ? { ...o, ...updates } : o)
    save(); broadcast('orders')
    return json(res, db.orders.find((o) => o.id === id))
  }

  // Users / customers
  if (path === '/users' && method === 'GET') {
    return json(res, db.users)
  }
  if (path === '/users' && method === 'POST') {
    const data = await body(req)
    if (db.users.find((u) => u.email === data.email))
      return json(res, { error: 'email-already-in-use' }, 409)
    db.users.push(data); save()
    return json(res, data)
  }
  if (path.startsWith('/users/') && method === 'PUT') {
    const uid = path.split('/')[2]
    const updates = await body(req)
    db.users = db.users.map((u) => u.uid === uid ? { ...u, ...updates } : u)
    save()
    return json(res, db.users.find((u) => u.uid === uid))
  }
  if (path === '/customers' && method === 'GET') {
    return json(res, db.customers)
  }
  if (path === '/customers' && method === 'POST') {
    const data = await body(req)
    if (db.customers.find((c) => c.email === data.email))
      return json(res, { error: 'email-already-in-use' }, 409)
    db.customers.push(data); save()
    return json(res, data)
  }

  json(res, { error: 'not found' }, 404)
})

server.listen(PORT, () => {
  console.log(`\n  Tik-Tak shared store running on http://localhost:${PORT}\n`)
})
