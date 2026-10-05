import { useEffect, useRef, useState } from 'react'
import { copy } from '../../content/copy'
import type { Reason } from '../../data/types'
import type { Flow } from '../../state/flow'
import { Sheet } from '../shell/Sheet'
import { Button } from '../shell/ui'

interface Opt {
  reason: Reason
  label: string
  hint?: string
  prominent?: boolean
  v2?: boolean
}

const OPTIONS: Opt[] = [
  { reason: 'market_falling', label: copy.reason.market, hint: copy.reason.marketHint, prominent: true },
  { reason: 'need_cash', label: copy.reason.cash, hint: copy.reason.cashHint },
  { reason: 'just_pause', label: copy.reason.just, hint: copy.reason.justHint },
  { reason: 'fund_doubt', label: copy.reason.fund, v2: true },
]

export function ReasonPicker({ flow }: { flow: Flow }) {
  const { actions } = flow
  const [picked, setPicked] = useState<Reason | null>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (o: Opt) => {
    setPicked(o.reason)
    // Short pause so the selected state is visible, then straight to the next step.
    timer.current = window.setTimeout(() => actions.selectReason(o.reason), o.v2 ? 0 : 160)
  }

  return (
    <Sheet title={copy.reason.title} subtitle={copy.reason.sub} onClose={() => actions.goto('sip_detail')} labelId="reason-title">
      <div className="space-y-2.5" role="group" aria-labelledby="reason-title">
        {OPTIONS.map((o) => {
          const on = picked === o.reason
          return (
            <button
              key={o.reason}
              type="button"
              aria-pressed={on}
              data-coach={`reason-${o.reason}`}
              onClick={() => choose(o)}
              className={[
                'flex w-full items-center justify-between gap-3 rounded-xl border px-4 text-left transition-colors',
                o.prominent ? 'min-h-[72px] py-3' : 'min-h-14 py-2.5',
                on
                  ? 'border-mist bg-white/10 text-paper'
                  : o.v2
                    ? 'border-graphite bg-transparent text-ash hover:bg-white/5'
                    : o.prominent
                      ? 'border-smoke bg-obsidian text-paper hover:bg-white/10'
                      : 'border-graphite bg-carbon text-paper hover:border-fog hover:bg-white/5',
              ].join(' ')}
            >
              <span>
                <span className={`block font-semibold ${o.prominent ? 'text-[17px]' : 'text-[15px]'}`}>{o.label}</span>
                {o.hint && <span className={`block text-xs ${on ? 'text-mist' : 'text-fog'}`}>{o.hint}</span>}
              </span>
              {o.v2 ? (
                <span className="rounded-full border border-smoke bg-carbon px-2 py-0.5 text-[11px] font-bold text-fog">V2</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

export function V2Sheet({ flow }: { flow: Flow }) {
  const { actions } = flow
  return (
    <Sheet title={copy.reason.v2Title} subtitle={copy.reason.v2Body} onClose={actions.closeSheet} labelId="v2-title">
      <div className="rounded-xl border border-graphite bg-white/5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{copy.reason.v2Preview}</p>
        <p className="mt-1.5 text-[15px] text-mist">{copy.reason.v2Detail}</p>
      </div>
      <Button className="mt-5 w-full" onClick={actions.closeSheet}>
        {copy.reason.v2Back}
      </Button>
    </Sheet>
  )
}
