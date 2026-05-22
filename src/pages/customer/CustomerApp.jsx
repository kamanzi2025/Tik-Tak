import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerBottomNav from '../../components/common/CustomerBottomNav'
import Home from './Home'
import RestaurantMenu from './RestaurantMenu'
import Cart from './Cart'
import Checkout from './Checkout'
import Orders from './Orders'
import Profile from './Profile'

export default function CustomerApp() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto relative overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route index element={<Home />} />
          <Route path="restaurant/:restaurantId" element={<RestaurantMenu />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
      <CustomerBottomNav />
    </div>
  )
}
