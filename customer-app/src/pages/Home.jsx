import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRestaurants } from '../hooks/useRestaurant'
import { useAuth } from '../hooks/useAuth'
import RestaurantCard from '../components/customer/RestaurantCard'
import Logo from '../components/common/Logo'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Home() {
  const { restaurants, loading } = useRestaurants()
  const { user, isGuest } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = restaurants.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.name?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.tagline?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full">
      <div className="bg-brand px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-white font-bold text-xl">Tik-Tak</h1>
            {user
              ? <p className="text-white/70 text-xs">Hey, {user.name}!</p>
              : <p className="text-white/70 text-xs">Guest mode — <Link to="/signin" className="underline">sign in</Link> to save history</p>
            }
          </div>
        </div>
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants or food…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-sm focus:outline-none shadow-sm" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="text-sm">No restaurants found</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
