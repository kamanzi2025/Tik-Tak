import { useNavigate } from 'react-router-dom'

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 inline mr-1 flex-shrink-0">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate()
  const { id, name, tagline, category, imageUrl, logoUrl, isOpen, location } = restaurant

  function handleClick() {
    if (!isOpen) return
    navigate(`/customer/restaurant/${id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-transform ${isOpen ? 'active:scale-95 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-customer-light to-gray-100">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isOpen ? 'bg-customer text-white' : 'bg-gray-500 text-white'
          }`}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="absolute bottom-2 left-2 w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
          <span className="text-[10px] bg-customer-light text-customer font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {category}
          </span>
        </div>
        {tagline && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tagline}</p>}
        <p className="text-xs text-gray-400 mt-1 flex items-center">
          <LocationIcon />
          {location}
        </p>
      </div>
    </div>
  )
}
