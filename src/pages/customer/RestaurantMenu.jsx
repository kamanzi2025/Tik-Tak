import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRestaurant } from '../../hooks/useRestaurant'
import { useMenu } from '../../hooks/useMenu'
import { useCart } from '../../contexts/CartContext'
import MenuItemCard from '../../components/customer/MenuItemCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
)
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 inline mr-1">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 inline mr-1">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default function RestaurantMenu() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { restaurant, loading: rLoading } = useRestaurant(restaurantId)
  const { items, categories, loading: mLoading } = useMenu(restaurantId)
  const { totalCount, restaurantId: cartRestId, restaurantName: cartRestName, clearCart } = useCart()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showCrossDialog, setShowCrossDialog] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  function handleCrossRestaurant() {
    setShowCrossDialog(true)
  }

  function handleClearAndContinue() {
    clearCart()
    setShowCrossDialog(false)
    setPendingItem(null)
  }

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (rLoading || mLoading) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      {/* Cross-restaurant dialog */}
      {showCrossDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">Different Restaurant</h3>
            <p className="text-sm text-gray-600 mb-4">
              You have items from <span className="font-semibold">{cartRestName}</span> in your cart.
              Clear cart and start a new order?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCrossDialog(false)}
                className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700"
              >Cancel</button>
              <button
                onClick={handleClearAndContinue}
                className="flex-1 bg-customer text-white rounded-xl py-2.5 text-sm font-semibold"
              >Clear &amp; Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="relative">
        <div className="h-44 bg-gray-200 overflow-hidden">
          {restaurant?.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-customer-light to-gray-200 flex items-center justify-center text-5xl">🍽️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <button
          onClick={() => navigate('/customer')}
          className="absolute top-10 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <BackIcon />
        </button>

        <button
          onClick={() => navigate('/customer/cart')}
          className="absolute top-10 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow relative"
        >
          <CartIcon />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-customer text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-white font-bold text-xl">{restaurant?.name}</h2>
          {restaurant?.tagline && <p className="text-white/80 text-xs">{restaurant.tagline}</p>}
          <div className="flex gap-3 mt-1">
            {restaurant?.location && (
              <span className="text-white/80 text-xs"><LocationIcon />{restaurant.location}</span>
            )}
            {restaurant?.openingHours && (
              <span className="text-white/80 text-xs"><ClockIcon />{restaurant.openingHours}</span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 bg-white">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-customer"
        />
      </div>

      {/* Category pills */}
      <div className="bg-white px-4 pt-2 pb-1 flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-customer text-white border-customer'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              restaurant={restaurant}
              onCrossRestaurant={handleCrossRestaurant}
            />
          ))
        )}
      </div>

      {/* Cart bar */}
      {totalCount > 0 && cartRestId === restaurantId && (
        <div className="fixed bottom-16 left-0 right-0 px-4 z-40">
          <button
            onClick={() => navigate('/customer/cart')}
            className="w-full bg-customer text-white rounded-xl py-3 flex items-center justify-between px-4 shadow-lg"
          >
            <span className="bg-customer-dark rounded-lg px-2 py-0.5 text-sm font-bold">{totalCount}</span>
            <span className="font-semibold">View Cart</span>
            <span className="text-sm opacity-90" />
          </button>
        </div>
      )}
    </div>
  )
}
