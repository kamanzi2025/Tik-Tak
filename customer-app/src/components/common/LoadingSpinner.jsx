export default function LoadingSpinner({ color = '#1D9E75', size = 40 }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <svg width={size} height={size} viewBox="0 0 40 40" className="animate-spin">
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray="60 40" strokeLinecap="round" />
      </svg>
    </div>
  )
}
