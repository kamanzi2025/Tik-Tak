import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'

export default function AppShell({ children }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto relative overflow-hidden">
      <OfflineBanner />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
