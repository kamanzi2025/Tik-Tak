# Tik-tak— Campus Cafeteria (Split-App Architecture)

Two separate React apps, one Firebase backend. Customers order from any of 5 restaurants; each restaurant's staff manages their own dashboard.

```
grab-and-go/
├── firebase/               ← Shared config template + security rules
│   ├── firebase.js
│   └── firestore.rules
├── customer-app/           ← Public-facing ordering app  (port 3000)
├── staff-app/              ← Restaurant management portal (port 3001)
└── seed.js                 ← Run once to populate Firestore
```

---

## Quick Start (5 steps)

### 1 · Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Authentication** → Sign-in method → enable **Email/Password**
3. **Firestore Database** → Create database → **production mode** → choose a region
4. **Project Settings** → Your apps → click **</>** (Web) → register app → copy `firebaseConfig`

### 2 · Add your Firebase config

Paste the same config object into **both** files:

```
customer-app/src/firebase/config.js
staff-app/src/firebase/config.js
```

Replace every `YOUR_*` placeholder with your real values.

Also paste it into `seed.js` (the `FIREBASE_CONFIG` constant at the top).

### 3 · Deploy Firestore security rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore      # choose your project, keep existing rules file path
firebase deploy --only firestore:rules
```

Or paste `firebase/firestore.rules` manually in the Firebase Console → Firestore → Rules tab.

> **Important:** The rules allow unauthenticated reads of restaurants and menu items (for guest browsing) and unauthenticated order creation (for guest checkout). Guest orders are identifiable only by their order code.

### 4 · Seed the database (one time only)

```bash
# From the project root
node seed.js
```

This creates:
- 5 restaurants with full details
- 5–6 menu items per restaurant
- 1 Firebase Auth staff account per restaurant
- 1 demo customer account

Credentials are printed at the end of the output.

### 5 · Run the apps

**Terminal 1 — Customer app:**
```bash
cd customer-app
npm install
npm run dev        # → http://localhost:3000
```

**Terminal 2 — Staff app:**
```bash
cd staff-app
npm install
npm run dev        # → http://localhost:3001
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@grabandgo.rw` | `Customer2024!` |
| Staff – Mama Africa Grill | `staff.mama@grabandgo.rw` | `MamaAfrica2024!` |
| Staff – Pizza Corner | `staff.pizza@grabandgo.rw` | `PizzaCorner2024!` |
| Staff – Café Latte | `staff.cafe@grabandgo.rw` | `CafeLatte2024!` |
| Staff – Green Bowl | `staff.green@grabandgo.rw` | `GreenBowl2024!` |
| Staff – Spice House | `staff.spice@grabandgo.rw` | `SpiceHouse2024!` |

---

## Customer App — Feature Map

### Guest mode (no login required)
| Screen | Path | Description |
|---|---|---|
| Welcome | `/` | Logo, "Browse as Guest", Sign In, Create Account |
| Home | `/home` | All 5 restaurants, search bar, Open/Closed badges |
| Restaurant Menu | `/restaurant/:id` | Category pills, item cards, cross-restaurant cart dialog |
| Cart | `/cart` | Qty steppers, remove items, subtotal |
| Checkout | `/checkout` | Guest fills name + phone. Payment: Mobile Money or Pay on Pickup |
| Order Confirmed | `/order-confirmed` | Prominent order code (e.g. **GG-4K2X**), live tracker, "Create account" prompt |
| Track Order | `/track` | Enter any code → live Received → Preparing → Ready → Completed tracker |

### Signed-in mode (adds)
| Screen | Path | Description |
|---|---|---|
| Orders | `/orders` | All past and active orders with live tracker; Reorder button |
| Profile | `/profile` | Edit name, sign out |
| Sign In | `/signin` | Email + password |
| Sign Up | `/signup` | Name + email + password; auto-links any pending guest order |

### Guest → account upgrade flow
1. Guest places order → sees order code on confirmation screen
2. Taps "Create Free Account" → goes to `/signup` with order code in state
3. On sign-up, the order's `customerId` is updated to the new user's UID
4. Order now appears in their Orders tab

### Navigation tabs
- **Guest:** Home · Cart · Track
- **Signed-in:** Home · Cart · Orders · Profile

---

## Staff App — Feature Map

Opens directly to login. No guest mode.

| Tab | Description |
|---|---|
| **Orders** | Live swimlane board: New → Preparing → Ready. Accept/Decline new orders, advance status. Web Audio beep on new orders. Red badge shows count of new orders. Also shows guest `orderCode` and phone. |
| **Menu** | Items grouped by category. In-stock toggle updates instantly. Tap to edit. Add/Delete with confirmation. |
| **Restaurant** | Edit all restaurant fields. Live preview card. "Accept Orders" master toggle → customer home updates instantly. |
| **Sales** | Filter: Today / This Week / This Month. Revenue, order count, top items, recent orders list. |
| **Settings** | Sound on/off, change password, sign out. |

---

## Real-Time Behaviour

| Trigger | Who sees it | Latency |
|---|---|---|
| Customer places order | Staff Orders tab (new card appears) | < 1 s |
| Staff accepts / advances order status | Customer order tracker | < 1 s |
| Staff toggles item `inStock` | Customer menu item greyed / available | < 1 s |
| Staff toggles `isOpen` | Customer home card Open/Closed badge | < 1 s |
| Staff edits restaurant name / tagline | Customer home card text | < 1 s |
| Guest enters order code on Track screen | Live status via `onSnapshot` | < 1 s |

---

## Firestore Data Model

```
restaurants/{restaurantId}
  name, tagline, description, category,
  imageUrl, logoUrl, isOpen, openingHours,
  location, phone, createdAt

menuItems/{itemId}
  restaurantId, name, category, price,
  description, imageUrl, inStock, createdAt

orders/{orderId}
  restaurantId, restaurantName,
  customerId,     ← null for guest orders
  customerName,   ← entered at checkout
  guestPhone,     ← guest only, for pickup notification
  orderCode,      ← "GG-XXXX" — guest tracking credential
  items: [{itemId, name, price, qty}],
  total, paymentMethod, note, status, createdAt

  status values: received → preparing → ready → completed | declined

users/{uid}
  name, email,
  role: "customer" | "staff",
  restaurantId    ← staff only
```

### Firestore indexes needed

If Firestore prompts you to create a composite index, click the link in the browser console error or create it manually:

| Collection | Fields |
|---|---|
| `menuItems` | `restaurantId` ASC, `category` ASC, `name` ASC |
| `orders` | `restaurantId` ASC, `createdAt` DESC |
| `orders` | `customerId` ASC, `createdAt` DESC |
| `orders` | `orderCode` ASC (for guest tracking) |

---

## Deployment

### Customer app → Firebase Hosting (public URL)
```bash
cd customer-app
npm run build
firebase init hosting        # point to dist/, configure as SPA
firebase deploy --only hosting
```

### Staff app → Separate subdomain or local build
Option A — second Firebase Hosting site (requires Blaze plan):
```bash
cd staff-app
npm run build
firebase hosting:sites:create staff-grabandgo
firebase target:apply hosting staff staff-grabandgo
firebase deploy --only hosting:staff
```

Option B — share the `dist/` folder with each restaurant and run it locally.

---

## Branding

| App | Primary colour | Usage |
|---|---|---|
| Customer | `#1D9E75` (green) | Header, buttons, active nav, badges |
| Staff | `#412402` (dark brown) | Header, buttons, active nav — clearly distinct |

Both apps: system sans-serif, mobile-first, minimum 44 px tap targets, bottom tab navigation.
