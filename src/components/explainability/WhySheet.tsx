import { useEffect, useMemo, useRef } from 'react'
import { copy } from '../../content/copy'
import { computeImpact } from '../../lib/calculations'
import { explain } from '../../lib/explainer'
import { ASSUMPTION_LINE, DATA_LINE, RECOVERY_NOTE, UPDATED_LINE, numberSources, type NumberId } from '../../lib/explainability'
import type { Flow } from '../../state/flow'
import { Sheet } from '../shell/Sheet'
import { Button } from '../shell/ui'

export function WhySheet({ flow, focus }: { flow: Flow; focus: NumberId }) {
  const { profile, state, actions } = flow
  const n = useMemo(() => computeImpact(profile), [profile])
  const sources = useMemo(() => numberSources(profile, n), [profile, n])
  const sentence = useMemo(() => explain({ profile, numbers: n, reason: state.reason ?? 'market_falling' }), [profile, n, state.reason])
  const focusRef = useRef<HTMLLIElement>(null)
  const focused = (id: string) => focus !== 'all' && (id === focus || (focus === 'goal_impact' && id === 'goal_delay'))

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: 'center' })
  }, [focus])

  return (
    <Sheet
      title={copy.why.title}
      onClose={actions.closeWhy}
      labelId="why-title"
      footer={
        <div>
          <Button className="w-full" onClick={actions.closeWhy}>
            {copy.why.close}
          </Button>
          <p className="mt-2 text-center text-xs font-semibold text-paper">{copy.disclaimer}</p>
        </div>
      }
    >
      <p className="rounded-xl bg-white/5 p-3.5 text-[15px] leading-snug text-paper" data-testid="plain-words">
        {sentence}
      </p>
      <p className="mt-2 text-xs text-fog">{copy.why.engineNote}</p>

      <dl data-coach="why-assumptions" className="mt-5 space-y-3.5 text-[15px]">
        <div>
          <dt className="text-[11px] font-bold tracking-[0.12em] text-mist">{copy.why.data.toUpperCase()}</dt>
          <dd className="mt-0.5 text-mist">{DATA_LINE}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold tracking-[0.12em] text-mist">{copy.why.assumptions.toUpperCase()}</dt>
          <dd className="mt-0.5 text-mist">
            {ASSUMPTION_LINE}
            <br />
            {RECOVERY_NOTE}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold tracking-[0.12em] text-mist">{copy.why.updated.toUpperCase()}</dt>
          <dd className="mt-0.5 text-mist">{UPDATED_LINE}</dd>
        </div>
      </dl>

      <h3 className="mt-6 text-sm font-bold text-paper">{copy.why.how}</h3>
      <ul className="mt-2 space-y-2">
        {sources.map((s) => {
          const on = focused(s.id)
          return (
            <li
              key={s.id}
              ref={s.id === focus ? focusRef : undefined}
              data-focused={on || undefined}
              className={`rounded-xl border p-3 ${on ? 'border-smoke bg-white/[0.03]' : 'border-graphite'}`}
            >
              <p className="text-sm font-semibold text-paper">{s.label}</p>
              <p className="mt-0.5 text-xs text-fog">Source: {s.source}</p>
              <p className="mt-1.5 text-sm text-mist">{s.how}</p>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-fog">{copy.why.consent}</p>
    </Sheet>
  )
}
