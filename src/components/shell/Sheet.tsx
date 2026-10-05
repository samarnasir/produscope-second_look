import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  /** Pinned at the bottom of the sheet, outside the scroll area. */
  footer?: ReactNode
  labelId?: string
}

/** Bottom sheet on phones, centred dialog on desktop. Esc and backdrop close it. */
export function Sheet({ title, subtitle, onClose, children, footer, labelId = 'sheet-title' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:max-lg:items-center" role="presentation">
      <div className="absolute inset-0 animate-fade-in bg-void/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] lg:max-h-[calc(100%-3.5rem)] w-full animate-sheet-up flex-col rounded-t-xl border border-graphite bg-carbon shadow-xl outline-none sm:max-lg:max-w-[480px] sm:max-lg:rounded-xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-smoke sm:max-lg:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <h2 id={labelId} className="text-xl font-bold text-paper">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-fog">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-mist hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="no-scrollbar overflow-y-auto px-5 pb-5 pt-4">{children}</div>
        {footer && <div className="border-t border-graphite px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}
