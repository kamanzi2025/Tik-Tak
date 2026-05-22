import { NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
)
const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
)
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const tabs = [
  { to: '/customer', label: 'Home', icon: HomeIcon, exact: true },
  { to: '/customer/cart', label: 'Cart', icon: CartIcon },
  { to: '/customer/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/customer/profile', label: 'Profile', icon: ProfileIcon },
]

export default function CustomerBottomNav() {
  const { totalCount } = useCart()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 safe-area-inset-bottom">
      {tabs.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? location.pathname === to : location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] relative"
          >
            <span className={active ? 'text-customer' : 'text-gray-400'}>
              <div className="relative inline-block">
                <Icon />
                {label === 'Cart' && totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-customer text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalCount > 9 ? '9+' : totalCount}
                  </span>
                )}
              </div>
            </span>
            <span className={`text-[10px] mt-0.5 font-medium ${active ? 'text-customer' : 'text-gray-400'}`}>
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
