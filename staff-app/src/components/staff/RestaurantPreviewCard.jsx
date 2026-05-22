import { useState } from 'react'

export default function RestaurantPreviewCard({ form }) {
  const [bannerErr, setBannerErr] = useState(false)
  const [logoErr, setLogoErr] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="relative h-28 bg-gray-100 overflow-hidden">
        {form.imageUrl && !bannerErr
          ? <img src={form.imageUrl} alt={form.name} onError={() => setBannerErr(true)} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100 text-3xl">🍽️</div>
        }
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${form.isOpen ? 'bg-brand text-white' : 'bg-gray-500 text-white'}`}>
          {form.isOpen ? 'OPEN' : 'CLOSED'}
        </span>
        {form.logoUrl && !logoErr && (
          <img src={form.logoUrl} alt="logo" onError={() => setLogoErr(true)} className="absolute bottom-2 left-2 w-9 h-9 rounded-full object-cover border-2 border-white shadow" />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm">{form.name || 'Restaurant Name'}</h3>
          {form.category && (
            <span className="text-[10px] bg-brand-light text-brand font-medium px-2 py-0.5 rounded-full whitespace-nowrap">{form.category}</span>
          )}
        </div>
        {form.tagline && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{form.tagline}</p>}
        {form.location && <p className="text-xs text-gray-400 mt-1">📍 {form.location}</p>}
      </div>
    </div>
  )
}
