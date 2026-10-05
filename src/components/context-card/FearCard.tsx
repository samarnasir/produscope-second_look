import { useMemo } from 'react'
import { copy } from '../../content/copy'
import { computeImpact } from '../../lib/calculations'
import { market } from '../../data/marketContext'
import { inr, months } from '../../lib/format'
import type { Flow } from '../../state/flow'
import type { NumberId } from '../../lib/explainability'
import { Footer } from '../shell/AppShell'
import { BackButton, Button, Card, InfoButton, SectionLabel } from '../shell/ui'
import { GoalBars } from './GoalBars'

function Section({ label, id, info, children }: { label: string; id: NumberId; info: (id: NumberId) => void; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <InfoButton label={`Why am I seeing this? ${label.toLowerCase()}`} onClick={() => info(id)} />
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </Card>
  )
}

export function FearCard({ flow }: { flow: Flow }) {
  const { profile: p, actions } = flow
  const n = useMemo(() => computeImpact(p), [p])
  const goal = p.goal
  const horizonYears = Math.round(n.horizonMonths / 12)

  return (
    <>
      <div className="px-5 pb-6 pt-3">
        <BackButton onClick={() => actions.goto('reason')} />
        <h1 className="mt-1 text-[28px] font-bold leading-tight text-navy">{copy.fear.title}</h1>
        {goal && (
          <p className="mt-1 text-sm text-muted">
            Based on your goal: {goal.short}, {goal.dateLabel}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <Section label={copy.fear.goal} id="goal_impact" info={actions.openWhy}>
            <p className="text-[17px] font-semibold leading-snug text-navy">
              Pausing {months(n.pauseMonths)} = {inr(n.missed)} not invested.
            </p>
            <p className="text-[15px] leading-snug text-ink">
              {goal && n.delayMonths !== null ? (
                <>
                  Your {goal.name}: <strong className="text-navy">{inr(n.impact)} less</strong> by {goal.dateLabel}, reached about{' '}
                  {months(n.delayMonths)} later.
                </>
              ) : (
                <>
                  Your investments: <strong className="text-navy">{inr(n.impact)} lower</strong> in {horizonYears} years.
                </>
              )}
            </p>
            <GoalBars pausePct={n.barPausePct} pauseMonths={n.pauseMonths} />
            <p className="text-xs text-muted">{copy.fear.barCaption}</p>
          </Section>

          <Section label={copy.fear.price} id="price_today" info={actions.openWhy}>
            <p className="text-[17px] font-semibold leading-snug text-navy">
              {copy.fear.priceLine(n.unitsMorePct, inr(p.sip.amount))}
            </p>
          </Section>

          <Section label={copy.fear.past} id="past_falls" info={actions.openWhy}>
            <p className="text-[15px] text-ink">{copy.fear.pastLine}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-pale p-3">
                <p>
                  <span className="block text-xs text-ink">Median recovery:{' '}</span>
                  <span className="block text-xl font-bold text-navy">~{market.recovery.medianMonths} months</span>
                </p>
              </div>
              <div className="rounded-lg bg-warn-pale p-3">
                <p>
                  <span className="block text-xs text-ink">Slowest recovery:{' '}</span>
                  <span className="block text-xl font-bold text-navy">~{market.recovery.slowestMonths} months</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">{copy.fear.illustrative}</p>
          </Section>
        </div>

        <Button variant="outline" className="mt-4 w-full" onClick={() => actions.openWhy('all')}>
          {copy.fear.why}
        </Button>
        <p className="mt-4 text-center text-xs font-medium text-muted">{copy.disclaimer}</p>
      </div>

      <Footer>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => actions.goto('decision')}>{copy.fear.options}</Button>
          <Button variant="outline" onClick={() => actions.decide('pause_anyway')}>
            {copy.fear.pauseAnyway}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted">{copy.fear.footerNote}</p>
      </Footer>
    </>
  )
}
