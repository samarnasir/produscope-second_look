import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold min-h-12 px-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const variants: Record<Variant, string> = {
  primary: 'bg-acid-lime text-void hover:bg-[#d6e41f] active:bg-[#c8d61c]',
  outline: 'border border-graphite text-mist hover:bg-white/5 hover:border-smoke',
  ghost: 'text-mist hover:bg-white/5',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Chip({ children, tone = 'warn' }: { children: ReactNode; tone?: 'warn' | 'blue' | 'muted' | 'good' }) {
  const tones = {
    warn: 'bg-coral-red/15 text-coral-red',
    blue: 'bg-white/5 text-mist',
    muted: 'bg-white/5 text-mist',
    good: 'bg-pulse-green/15 text-pulse-green',
  }
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-graphite bg-carbon ${className}`}>{children}</div>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="text-[11px] font-semibold tracking-[0.12em] text-fog">{children}</h3>
}

export function InfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-grid size-6 shrink-0 place-items-center rounded-full border border-smoke text-[11px] font-bold text-mist hover:bg-white/5 align-middle"
    >
      i
    </button>
  )
}

export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-mist hover:bg-white/5"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  )
}
