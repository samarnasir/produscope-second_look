import { useEffect, useState, type RefObject } from 'react'
import { copy } from '../../content/copy'
import { tourKey, type Tour } from '../../state/tour'
import type { Flow } from '../../state/flow'

interface Rect { left: number; top: number; width: number; height: number }
interface Measure { wide: boolean; frame: Rect; rects: Record<string, Rect> }

const TIP_W = 264
const GAP = 28
const SIDE_NEED = TIP_W + GAP + 8
const FOOTER_H = 90
const TIP_H = 170

const plain = (r: DOMRect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height })
const same = (a: Measure | null, b: Measure) => !!a && JSON.stringify(a) === JSON.stringify(b)

/**
 * Coach marks live outside the phone so they can spill beside it on desktop.
 * At most two show at once (one per side); on small screens one shows inside the viewport.
 */
export function CoachMarks({ flow, tour, frame }: { flow: Flow; tour: Tour; frame: RefObject<HTMLElement | null> }) {
  const key = tourKey(flow.state)
  const tips = (key && copy.tour.tips[key]) || []
  const unseen = tour.on ? tips.filter((t) => !tour.seen.has(`${key}:${t.target}`)) : []
  const sig = unseen.map((t) => t.target).join('|')

  const [mounted, setMounted] = useState(false)
  const [m, setM] = useState<Measure | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const f = frame.current
    if (!mounted || !f || !sig) {
      setM(null)
      return
    }
    const targets = sig.split('|')
    const measure = () => {
      const fr = f.getBoundingClientRect()
      const rects: Record<string, Rect> = {}
      for (const t of targets) {
        const el = document.querySelector<HTMLElement>(`[data-coach="${t}"]`)
        if (!el) continue
        const r = el.getBoundingClientRect()
        const cy = r.top + r.height / 2
        const inFrame = window.innerWidth >= 1024 ? cy > fr.top + 56 && cy < fr.bottom - 24 : cy > 56 && cy < window.innerHeight - 24
        if (inFrame && r.width > 0) rects[t] = plain(r)
      }
      const next: Measure = { wide: window.innerWidth >= 1024, frame: plain(fr), rects }
      setM((prev) => (same(prev, next) ? prev : next))
    }
    measure()
    const id = window.setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [mounted, sig, frame])

  if (!m) return null
  const candidates = unseen.filter((t) => m.rects[t.target])
  if (!candidates.length) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const sides = (['right', 'left'] as const).filter((s) => (s === 'right' ? vw - (m.frame.left + m.frame.width) : m.frame.left) >= SIDE_NEED)
  let shown = m.wide && sides.length ? candidates.slice(0, sides.length) : candidates.slice(0, 1)
  // Each tip goes on the side nearest its target so connectors never cross other controls.
  const cx = (t: (typeof shown)[number]) => m.rects[t.target].left + m.rects[t.target].width / 2
  let assign: ('left' | 'right')[] = []
  if (m.wide && sides.length) {
    if (shown.length === 2) {
      shown = [...shown].sort((a, b) => cx(a) - cx(b))
      assign = ['left', 'right']
    } else {
      const mid = m.frame.left + m.frame.width / 2
      assign = [cx(shown[0]) < mid && sides.includes('left') ? 'left' : sides.includes('right') ? 'right' : 'left']
    }
  }

  const card = (t: (typeof shown)[number], style: React.CSSProperties, arrow?: React.ReactNode) => (
    <div
      key={t.target}
      role="status"
      data-testid="coach-tip"
      className="pointer-events-auto fixed animate-rise rounded-xl border border-smoke bg-obsidian p-3.5 shadow-xl"
      style={{ width: m.wide ? TIP_W : Math.min(268, vw - 24), ...style }}
    >
      {arrow}
      <p className="text-sm font-semibold text-paper">{t.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-mist">{t.body}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" onClick={tour.skip} className="min-h-8 rounded px-1 text-xs text-fog hover:text-mist">
          {copy.tour.skip}
        </button>
        <button
          type="button"
          onClick={() => tour.dismiss(`${key}:${t.target}`)}
          className="min-h-8 rounded-full bg-paper px-3.5 text-[13px] font-semibold text-void hover:bg-bone"
        >
          {copy.tour.gotIt}
        </button>
      </div>
    </div>
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-live="polite">
      {shown.map((t) => {
        const r = m.rects[t.target]
        return (
          <div
            key={`ring-${t.target}`}
            className="fixed animate-pulse rounded-md ring-2 ring-mist"
            style={{ left: r.left - 3, top: r.top - 3, width: r.width + 6, height: r.height + 6 }}
            aria-hidden="true"
          />
        )
      })}

      {m.wide && sides.length ? (
        <>
          <svg className="fixed inset-0 size-full" aria-hidden="true">
            {shown.map((t, i) => {
              const r = m.rects[t.target]
              const side = assign[i]
              const cy = r.top + r.height / 2
              const ty = Math.max(100, Math.min(cy, vh - 100))
              const x1 = side === 'right' ? m.frame.left + m.frame.width + GAP : m.frame.left - GAP
              const x2 = side === 'right' ? r.left + r.width - 2 : r.left + 2
              return (
                <g key={t.target} stroke="#8a8f98" strokeWidth="1">
                  <line x1={x1} y1={ty} x2={x2} y2={cy} strokeDasharray="3 3" />
                  <circle cx={x2} cy={cy} r="3" fill="#8a8f98" />
                </g>
              )
            })}
          </svg>
          {shown.map((t, i) => {
            const r = m.rects[t.target]
            const side = assign[i]
            const cy = r.top + r.height / 2
            const ty = Math.max(100, Math.min(cy, vh - 100))
            return card(t, {
              top: ty,
              transform: 'translateY(-50%)',
              left: side === 'right' ? m.frame.left + m.frame.width + GAP : m.frame.left - GAP - TIP_W,
            })
          })}
        </>
      ) : (
        shown.map((t) => {
          const r = m.rects[t.target]
          const W = Math.min(268, vw - 24)
          const left = Math.max(12, Math.min(r.left + r.width / 2 - W / 2, vw - W - 12))
          const below = vh - FOOTER_H - (r.top + r.height) >= TIP_H || r.top - 56 < TIP_H
          const arrowX = Math.max(18, Math.min(r.left + r.width / 2 - left, W - 18))
          return card(
            t,
            { left, ...(below ? { top: r.top + r.height + 12 } : { bottom: vh - r.top + 12 }) },
            <span
              className={`absolute size-3 rotate-45 border-smoke bg-obsidian ${below ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-b border-r'}`}
              style={{ left: arrowX - 6 }}
              aria-hidden="true"
            />,
          )
        })
      )}
    </div>
  )
}
