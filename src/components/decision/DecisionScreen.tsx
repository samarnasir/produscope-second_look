import { copy } from '../../content/copy'
import { inr } from '../../lib/format'
import { show48h } from '../../lib/rules'
import type { Choice } from '../../data/types'
import type { Flow } from '../../state/flow'
import { BackButton } from '../shell/ui'
import { Footer } from '../shell/AppShell'

export function DecisionScreen({ flow }: { flow: Flow }) {
  const { profile: p, state, actions } = flow
  const d = copy.decision
  const items: { choice: Choice; label: string; sub: string }[] = [
    { choice: 'continue', label: d.continue, sub: d.continueSub(inr(p.sip.amount)) },
    { choice: 'pause_1m', label: d.pause1, sub: d.pause1Sub(p.sip.nextLabel, p.sip.resume1mLabel) },
    ...(show48h(p, state.reason)
      ? [{ choice: 'remind_48h' as Choice, label: d.remind, sub: d.remindSub(p.sip.reminderLabel) }]
      : []),
    { choice: 'pause_anyway', label: d.pauseAnyway, sub: d.pauseAnywaySub(p.sip.resume6mLabel) },
  ]
  const backTo = state.reason === 'market_falling' ? 'fear' : 'reason'

  return (
    <>
      <div className="px-5 pb-6 pt-3">
        <BackButton onClick={() => actions.goto(backTo)} />
        <h1 className="mt-1 text-[28px] font-bold leading-tight text-paper">{d.title}</h1>
        <p className="mt-1 text-sm text-fog">{d.sub}</p>
        <p className="mt-3 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-mist">
          SIP active · next instalment {state.sip.nextLabel}
        </p>

        <div data-coach="decision-list" className="mt-5 space-y-3">
          {items.map((i) => (
            <button
              key={i.choice}
              type="button"
              onClick={() => actions.decide(i.choice)}
              className="flex min-h-[72px] w-full flex-col justify-center rounded-xl border border-smoke bg-carbon px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <span className="text-base font-semibold text-mist">{i.label}</span>
              <span className="mt-0.5 text-sm text-mist">{i.sub}</span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-fog">{copy.disclaimer}</p>
      </div>
      <Footer>
        <p className="text-center text-sm font-medium text-paper">{d.footer}</p>
      </Footer>
    </>
  )
}
