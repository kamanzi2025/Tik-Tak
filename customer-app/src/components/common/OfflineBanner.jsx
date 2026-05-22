import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const go = () => setOffline(false)
    const stop = () => setOffline(true)
    window.addEventListener('online', go)
    window.addEventListener('offline', stop)
    return () => { window.removeEventListener('online', go); window.removeEventListener('offline', stop) }
  }, [])

  if (!offline) return null

  return (
    <div className="bg-red-500 text-white text-xs font-medium text-center py-2 px-4 z-50">
      No internet connection — check your network
    </div>
  )
}
