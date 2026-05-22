const STEPS = [
  { key: 'received', label: 'Received' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
]

export default function OrderTracker({ status }) {
  const current = STEPS.findIndex((s) => s.key === status)
  return (
    <div className="flex items-center w-full py-2">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${i <= current ? 'bg-brand border-brand' : 'bg-white border-gray-300'}`}>
              {i <= current && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span className={`text-[9px] mt-1 text-center leading-tight max-w-[50px] ${i <= current ? 'text-brand font-semibold' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-3 ${i < current ? 'bg-brand' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
