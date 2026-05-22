export default function Logo({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="10" fill="#412402" />
      <path d="M12 17h16l-2.5 13h-11L12 17z" fill="white" />
      <path d="M16 17v-3a4 4 0 018 0v3" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
