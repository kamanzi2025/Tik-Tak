import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useOrderByCode } from '../hooks/useOrders'
import OrderTracker from '../components/customer/OrderTracker'

export default function OrderConfirmed() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orderCode, restaurantName } = location.state || {}

  const { order, loading } = useOrderByCode(orderCode)

  if (!orderCode) {
    navigate('/home', { replace: true }); return null
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Success header */}
        <div className="pt-14 pb-6 text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 text-sm mt-1">{restaurantName}</p>
        </div>

        {/* Order code — the most important thing */}
        <div className="bg-brand rounded-2xl p-6 text-center shadow-md mb-4">
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Your Order Code</p>
          <p className="text-white font-bold text-5xl tracking-widest">{orderCode}</p>
          <p className="text-white/70 text-xs mt-2">Show this code when collecting your order</p>
        </div>

        {/* Live tracker */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">Live Status</p>
          {loading ? (
            <div className="h-16 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : order ? (
            <>
              <OrderTracker status={order.status} />
              {order.status === 'ready' && (
                <div className="bg-brand text-white rounded-xl px-3 py-2 flex items-center gap-2 mt-2">
                  <span>🎉</span>
                  <span className="text-sm font-semibold">Your order is ready for pickup!</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">Order status unavailable</p>
          )}
        </div>

        {/* Track later reminder */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-1">Track anytime</p>
          <p className="text-xs text-gray-500 mb-3">
            Use code <span className="font-bold text-brand">{orderCode}</span> on the Track Order screen to check your status anytime.
          </p>
          <button onClick={() => navigate('/track', { state: { prefillCode: orderCode } })}
            className="w-full border border-brand text-brand rounded-xl py-2.5 text-sm font-semibold">
            Open Tracker
          </button>
        </div>

        {/* Sign-up prompt for guests */}
        {!user && (
          <div className="bg-gradient-to-br from-brand-light to-white rounded-2xl p-4 border border-brand/20">
            <p className="font-semibold text-gray-900 text-sm">Save your order history</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">
              Create a free account and this order will be linked to your profile automatically.
            </p>
            <Link
              to="/signup"
              state={{ fromOrder: orderCode }}
              className="block w-full bg-brand text-white rounded-xl py-2.5 text-sm font-semibold text-center"
            >
              Create Free Account
            </Link>
            <button onClick={() => navigate('/home')}
              className="block w-full text-center text-xs text-gray-400 mt-2 py-1">
              Maybe later
            </button>
          </div>
        )}

        {user && (
          <button onClick={() => navigate('/orders')}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-semibold">
            View All Orders
          </button>
        )}
      </div>
    </div>
  )
}
