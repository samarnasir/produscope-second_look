/** Second Look mark: two overlapping rings, one look and a second one. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#161718" stroke="#383b3f" />
      <g stroke="#fff" strokeWidth="2">
        <circle cx="12" cy="16" r="6.5" />
        <circle cx="20" cy="16" r="6.5" />
      </g>
    </svg>
  )
}
