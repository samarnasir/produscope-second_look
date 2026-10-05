import { copy } from '../../content/copy'

export function GoalBars({ pausePct, pauseMonths }: { pausePct: number; pauseMonths: number }) {
  const rows = [
    { label: copy.fear.keep, pct: 100, color: 'bg-blue' },
    { label: copy.fear.pause(pauseMonths), pct: pausePct, color: 'bg-blue-tint' },
  ]
  return (
    <div className="space-y-3" role="img" aria-label={`${rows[0].label} ${rows[0].pct}%, ${rows[1].label} ${rows[1].pct}%`}>
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium text-navy">{r.label}</span>
            <span className="text-lg font-bold text-navy">{r.pct}%</span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full origin-left rounded-full ${r.color}`}
              style={{ width: `${r.pct}%`, animation: `bar-grow 600ms ${200 + i * 150}ms ease-out both` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
