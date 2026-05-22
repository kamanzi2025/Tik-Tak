/**
 * Grab & Go — Seed Script
 * ========================
 * Run ONCE after configuring Firebase:
 *
 *   node scripts/seed.js
 *
 * Prerequisites:
 *   npm install firebase
 *   Update FIREBASE_CONFIG below with your actual credentials.
 *   Enable Email/Password auth in Firebase Console.
 *
 * What this creates:
 *   - 5 restaurants in Firestore (restaurants collection)
 *   - 5–6 menu items per restaurant (menuItems collection)
 *   - 5 staff accounts in Firebase Auth + users collection
 *   - 1 demo customer account
 */

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'

// ─── REPLACE WITH YOUR FIREBASE CONFIG ───────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(FIREBASE_CONFIG)
const auth = getAuth(app)
const db = getFirestore(app)

const RESTAURANTS = [
  {
    id: 'mama-africa',
    name: 'Mama Africa Grill',
    tagline: 'Authentic Rwandan flavors, made with love',
    description: 'Home-style Rwandan cooking serving hearty mains including grilled meats, brochettes, and isombe. A campus favourite since day one.',
    category: 'Rwandan mains',
    location: 'Block A, Ground Floor',
    openingHours: 'Mon–Fri 7am–5pm',
    phone: '0788 100 001',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&auto=format&fit=crop',
    isOpen: true,
    staff: { email: 'staff.mama@grabandgo.rw', password: 'MamaAfrica2024!' },
  },
  {
    id: 'pizza-corner',
    name: 'Pizza Corner',
    tagline: 'Fast food and snacks done right',
    description: 'Your go-to spot for pizzas, burgers, fries, and quick bites. Freshly made and ready in minutes.',
    category: 'Fast food & snacks',
    location: 'Block B, Ground Floor',
    openingHours: 'Mon–Sat 8am–6pm',
    phone: '0788 100 002',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop',
    isOpen: true,
    staff: { email: 'staff.pizza@grabandgo.rw', password: 'PizzaCorner2024!' },
  },
  {
    id: 'cafe-latte',
    name: 'Café Latte',
    tagline: 'Specialty coffee & freshly baked pastries',
    description: 'Start your day right with Arabica coffee, croissants, and seasonal pastries. A calm corner to study or catch up.',
    category: 'Coffee & pastries',
    location: 'Main Building, Entrance',
    openingHours: 'Mon–Fri 6:30am–4pm',
    phone: '0788 100 003',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&auto=format&fit=crop',
    isOpen: true,
    staff: { email: 'staff.cafe@grabandgo.rw', password: 'CafeLatte2024!' },
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl',
    tagline: 'Fresh salads & healthy meals',
    description: 'Eat clean, feel great. Customisable salad bowls, grain bowls, fresh juices, and smoothies made to order.',
    category: 'Salads & healthy food',
    location: 'Block C, First Floor',
    openingHours: 'Mon–Fri 8am–5pm',
    phone: '0788 100 004',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&auto=format&fit=crop',
    isOpen: true,
    staff: { email: 'staff.green@grabandgo.rw', password: 'GreenBowl2024!' },
  },
  {
    id: 'spice-house',
    name: 'Spice House',
    tagline: 'Bold Indian & Asian flavours',
    description: 'Aromatic curries, stir-fries, and noodle dishes from across South and East Asia. Vegetarian options available.',
    category: 'Indian & Asian dishes',
    location: 'Block A, First Floor',
    openingHours: 'Mon–Fri 11am–5pm',
    phone: '0788 100 005',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop',
    isOpen: false,
    staff: { email: 'staff.spice@grabandgo.rw', password: 'SpiceHouse2024!' },
  },
]

const MENU_ITEMS = {
  'mama-africa': [
    { name: 'Isombe & Ugali', category: 'Mains', price: 1500, description: 'Cassava leaves stewed with eggplant, served with ugali', inStock: true },
    { name: 'Grilled Brochettes', category: 'Grills', price: 2500, description: 'Skewered beef or goat marinated in local spices', inStock: true },
    { name: 'Ibirayi n\'inyama', category: 'Mains', price: 2000, description: 'Fried potatoes with beef stew, a campus classic', inStock: true },
    { name: 'Ibiharage', category: 'Mains', price: 1200, description: 'Spiced red beans served with rice or ugali', inStock: true },
    { name: 'Akabanga Chicken', category: 'Grills', price: 3000, description: 'Whole quarter chicken with spicy akabanga marinade', inStock: true },
    { name: 'Fresh Passion Juice', category: 'Drinks', price: 800, description: 'Freshly blended passion fruit juice', inStock: true },
  ],
  'pizza-corner': [
    { name: 'Margherita Pizza', category: 'Pizza', price: 4500, description: 'Classic tomato, mozzarella, and fresh basil', inStock: true },
    { name: 'Chicken BBQ Pizza', category: 'Pizza', price: 5500, description: 'Grilled chicken, BBQ sauce, red onion, corn', inStock: true },
    { name: 'Beef Burger', category: 'Burgers', price: 3500, description: 'Juicy beef patty with lettuce, tomato, and special sauce', inStock: true },
    { name: 'Crispy Fries', category: 'Sides', price: 1000, description: 'Golden shoestring fries with seasoning', inStock: true },
    { name: 'Chicken Wrap', category: 'Snacks', price: 2800, description: 'Grilled chicken, avocado, and coleslaw in a soft wrap', inStock: false },
    { name: 'Soft Drink (330ml)', category: 'Drinks', price: 600, description: 'Coke, Fanta, or Sprite — your choice', inStock: true },
  ],
  'cafe-latte': [
    { name: 'Cappuccino', category: 'Coffee', price: 1500, description: 'Espresso with steamed milk foam, medium cup', inStock: true },
    { name: 'Flat White', category: 'Coffee', price: 1800, description: 'Double ristretto with velvety microfoam milk', inStock: true },
    { name: 'Chocolate Croissant', category: 'Pastries', price: 1200, description: 'Buttery, flaky croissant filled with dark chocolate', inStock: true },
    { name: 'Blueberry Muffin', category: 'Pastries', price: 1000, description: 'Moist muffin packed with fresh blueberries', inStock: true },
    { name: 'Iced Matcha Latte', category: 'Cold Drinks', price: 2000, description: 'Ceremonial grade matcha with oat milk over ice', inStock: true },
    { name: 'Banana Bread Slice', category: 'Pastries', price: 900, description: 'Moist banana bread with a hint of cinnamon', inStock: true },
  ],
  'green-bowl': [
    { name: 'Caesar Salad', category: 'Salads', price: 2500, description: 'Romaine, croutons, parmesan, house Caesar dressing', inStock: true },
    { name: 'Avocado Grain Bowl', category: 'Bowls', price: 3200, description: 'Quinoa, roasted veggies, avocado, tahini dressing', inStock: true },
    { name: 'Green Smoothie', category: 'Drinks', price: 1800, description: 'Spinach, banana, pineapple, coconut water', inStock: true },
    { name: 'Grilled Chicken Salad', category: 'Salads', price: 3000, description: 'Mixed greens, grilled chicken, cherry tomatoes, lemon vinaigrette', inStock: true },
    { name: 'Hummus & Veggie Wrap', category: 'Wraps', price: 2200, description: 'Hummus, roasted bell peppers, cucumber, spinach in a whole wheat wrap', inStock: true },
    { name: 'Fresh Orange Juice', category: 'Drinks', price: 1200, description: 'Cold-pressed orange juice, no sugar added', inStock: true },
  ],
  'spice-house': [
    { name: 'Butter Chicken', category: 'Curries', price: 3500, description: 'Creamy tomato-based curry with tender chicken pieces', inStock: true },
    { name: 'Vegetable Biryani', category: 'Rice', price: 2800, description: 'Fragrant basmati rice with spiced mixed vegetables', inStock: true },
    { name: 'Pad Thai Noodles', category: 'Noodles', price: 3000, description: 'Stir-fried rice noodles with egg, bean sprouts, and peanuts', inStock: true },
    { name: 'Samosa (2 pcs)', category: 'Starters', price: 1000, description: 'Crispy pastry filled with spiced potatoes and peas', inStock: true },
    { name: 'Mango Lassi', category: 'Drinks', price: 1200, description: 'Chilled yoghurt drink blended with ripe mangoes', inStock: true },
    { name: 'Masala Chai', category: 'Drinks', price: 800, description: 'Spiced Indian tea with milk and cardamom', inStock: true },
  ],
}

const DEMO_CUSTOMER = {
  email: 'customer@grabandgo.rw',
  password: 'Customer2024!',
  name: 'Demo Customer',
}

async function createUser(email, password, data) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...data,
      email,
      createdAt: serverTimestamp(),
    })
    return cred.user.uid
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`  ⚠️  User ${email} already exists — skipping`)
      return null
    }
    throw err
  }
}

async function seed() {
  console.log('\n🌱 Starting Grab & Go seed...\n')

  // Seed restaurants and staff
  for (const restaurant of RESTAURANTS) {
    const { staff, ...restaurantData } = restaurant
    const { id, ...firestoreData } = restaurantData

    console.log(`📍 Creating restaurant: ${restaurant.name}`)
    await setDoc(doc(db, 'restaurants', id), {
      ...firestoreData,
      createdAt: serverTimestamp(),
    })

    // Staff account
    console.log(`  👤 Creating staff: ${staff.email}`)
    await createUser(staff.email, staff.password, {
      name: `${restaurant.name} Staff`,
      role: 'staff',
      restaurantId: id,
    })

    // Menu items
    const items = MENU_ITEMS[id] || []
    console.log(`  🍴 Adding ${items.length} menu items...`)
    for (const item of items) {
      await addDoc(collection(db, 'menuItems'), {
        ...item,
        restaurantId: id,
        imageUrl: '',
        createdAt: serverTimestamp(),
      })
    }

    console.log(`  ✅ Done\n`)
  }

  // Demo customer
  console.log(`👤 Creating demo customer: ${DEMO_CUSTOMER.email}`)
  await createUser(DEMO_CUSTOMER.email, DEMO_CUSTOMER.password, {
    name: DEMO_CUSTOMER.name,
    role: 'customer',
  })

  console.log('\n✅ Seed complete!\n')
  console.log('─────────────────────────────────────────')
  console.log('Demo accounts:')
  console.log(`  Customer:  ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`)
  RESTAURANTS.forEach((r) => {
    console.log(`  ${r.name}: ${r.staff.email} / ${r.staff.password}`)
  })
  console.log('─────────────────────────────────────────\n')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
