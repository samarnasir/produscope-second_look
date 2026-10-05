import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { copy } from '../../content/copy'
import { tourKey, type Tour } from '../../state/tour'
import type { Flow } from '../../state/flow'

interface Box { left: number; top: number; width: number; height: number }

/** Position of a [data-coach] element relative to the phone frame. Re-measured while sheets animate. */
function useTargetBox(target: string | null, frame: RefObject<HTMLElement | null>, deps: unknown[]) {
  const [box, setBox] = useState<(Box & { fw: number; fh: number }) | null>(null)
  useLayoutEffect(() => {
    const f = frame.current
    if (!f || !target) {
      setBox(null)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const measure = () => {
      const el = f.querySelector<HTMLElement>(`[data-coach="${target}"]`)
      if (!el) return setBox((b) => (b ? null : b))
      const fr = f.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const next = {
        left: r.left - fr.left - f.clientLeft,
        top: r.top - fr.top - f.clientTop,
        width: r.width,
        height: r.height,
        fw: f.clientWidth,
        fh: f.clientHeight,
      }
      setBox((b) => (b && Object.keys(next).every((k) => Math.abs((b as never)[k] - (next as never)[k]) < 0.5) ? b : next))
    }
    const loop = () => {
      measure()
      if (performance.now() - t0 < 700) raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, frame, ...deps])
  return box
}

const TIP_H = 170
const FOOTER_H = 90
function fitsBelow(b: Box & { fh: number }) {
  const spaceBelow = b.fh - FOOTER_H - (b.top + b.height)
  const spaceAbove = b.top - 56
  return spaceBelow >= TIP_H || spaceAbove < TIP_H
}

export function CoachMarks({ flow, tour, frame }: { flow: Flow; tour: Tour; frame: RefObject<HTMLElement | null> }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 500)
    return () => window.clearTimeout(t)
  }, [])

  const key = tourKey(flow.state)
  const tips = (key && copy.tour.tips[key]) || []
  const idx = tips.findIndex((_, i) => !tour.seen.has(`${key}:${i}`))
  const tip = tour.on && idx >= 0 ? tips[idx] : null
  const box = useTargetBox(tip?.target ?? null, frame, [key, idx, mounted])

  if (!tip || !box || !mounted) return null

  const W = Math.min(268, box.fw - 24)
  const left = Math.max(12, Math.min(box.left + box.width / 2 - W / 2, box.fw - W - 12))
  // Keep ~90px clear for the sticky footer; prefer below, fall back to above.
  const below = fitsBelow(box)
  const arrowX = Math.max(18, Math.min(box.left + box.width / 2 - left, W - 18))
  const last = idx === tips.length - 1
  const pos = below ? { top: box.top + box.height + 12 } : { bottom: box.fh - box.top + 12 }

  return (
    <div className="pointer-events-none absolute inset-0 z-[60]" aria-live="polite">
      <div
        className="absolute animate-pulse rounded-md ring-2 ring-mist"
        style={{ left: box.left - 3, top: box.top - 3, width: box.width + 6, height: box.height + 6 }}
        aria-hidden="true"
      />
      <div
        role="status"
        data-testid="coach-tip"
        className="pointer-events-auto absolute animate-rise rounded-xl border border-smoke bg-obsidian p-3.5 shadow-xl"
        style={{ left, width: W, ...pos }}
      >
        <span
          className={`absolute size-3 rotate-45 border-smoke bg-obsidian ${below ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-b border-r'}`}
          style={{ left: arrowX - 6 }}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-paper">{tip.title}</p>
        <p className="mt-1 text-[13px] leading-snug text-mist">{tip.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={tour.skip} className="min-h-8 rounded px-1 text-xs text-fog hover:text-mist">
            {copy.tour.skip}
          </button>
          <div className="flex items-center gap-2.5">
            {tips.length > 1 && (
              <span className="font-mono text-xs text-ash">
                {idx + 1}/{tips.length}
              </span>
            )}
            <button
              type="button"
              onClick={() => tour.dismiss(`${key}:${idx}`)}
              className="min-h-8 rounded-full bg-paper px-3.5 text-[13px] font-semibold text-void hover:bg-bone"
            >
              {last ? copy.tour.gotIt : copy.tour.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
