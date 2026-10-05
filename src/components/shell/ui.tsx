import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold min-h-12 px-4 text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-strong active:bg-navy',
  outline: 'border border-blue text-blue bg-white hover:bg-blue-pale',
  ghost: 'text-blue hover:bg-blue-pale',
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
    warn: 'bg-warn-pale text-[#a85a12]',
    blue: 'bg-blue-pale text-blue-strong',
    muted: 'bg-surface text-ink',
    good: 'bg-good-pale text-good',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-white ${className}`}>{children}</div>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="text-[11px] font-bold tracking-[0.12em] text-blue">{children}</h3>
}

export function InfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-grid size-6 shrink-0 place-items-center rounded-full border border-blue/40 text-[11px] font-bold text-blue hover:bg-blue-pale align-middle"
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
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-blue hover:bg-blue-pale"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  )
}
