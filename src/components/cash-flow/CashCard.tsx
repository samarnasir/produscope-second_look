import { useState } from 'react'
import { copy } from '../../content/copy'
import { inr, ordinal } from '../../lib/format'
import type { Flow } from '../../state/flow'
import { BackButton, Button, Card } from '../shell/ui'
import { Sheet } from '../shell/Sheet'

const DAYS = [15, 20, 25, 28]

function Row({ title, sub, onClick, coach }: { title: string; sub: string; onClick: () => void; coach: string }) {
  return (
    <button
      data-coach={coach}
      type="button"
      onClick={onClick}
      className="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-xl border border-graphite bg-carbon px-4 py-3 text-left transition-colors hover:border-fog hover:bg-white/5"
    >
      <span>
        <span className="block text-[15px] font-semibold text-paper">{title}</span>
        <span className="block text-sm text-mist">{sub}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-mist" aria-hidden="true">
        <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function ChipGroup<T extends number>({ label, values, value, onChange, format }: { label: string; values: T[]; value: T; onChange: (v: T) => void; format: (v: T) => string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`min-h-12 rounded-md border px-2 text-sm font-semibold transition-colors ${value === v ? 'border-mist bg-white/10 text-paper' : 'border-graphite text-paper hover:border-fog hover:bg-white/5'}`}
        >
          {format(v)}
        </button>
      ))}
    </div>
  )
}

export function CashCard({ flow }: { flow: Flow }) {
  const { profile: p, state, actions } = flow
  const c = copy.cash
  const [amount, setAmount] = useState(p.sip.reduceOptions[1])
  const [day, setDay] = useState(DAYS[0])

  return (
    <>
      <div className="px-5 pb-8 pt-3">
        <BackButton onClick={() => actions.goto('reason')} />
        <h1 className="mt-1 text-[28px] font-bold leading-tight text-paper">{c.title}</h1>
        <Card className="mt-3 border-smoke bg-white/[0.03] p-4">
          {p.cashNeed && (
            <p className="mb-1 text-sm font-semibold text-paper">
              You need {inr(p.cashNeed.amount)} for {p.cashNeed.reason}.
            </p>
          )}
          <p className="text-[15px] leading-snug text-mist">{c.body}</p>
        </Card>

        <Button data-coach="cash-pause" className="mt-4 w-full" onClick={() => actions.decide('pause_anyway')}>
          {c.pause}
        </Button>
        <p className="mt-1.5 text-center text-xs text-fog">{c.pauseNote}</p>

        <p className="mb-2 mt-6 text-[11px] font-bold tracking-[0.12em] text-mist">OR KEEP YOUR SIP AND FREE UP CASH</p>
        <div className="space-y-2.5">
          <Row title={c.skip} sub={c.skipSub(p.sip.nextLabel, p.sip.resume1mLabel)} coach="cash-skip" onClick={() => actions.decide('skip_1')} />
          <Row title={c.reduce} sub={c.reduceSub} coach="cash-reduce" onClick={() => actions.openSheet('reduce')} />
          <Row title={c.move} sub={c.moveSub} coach="cash-move" onClick={() => actions.openSheet('move_date')} />
          <Row title={c.emergency} sub={c.emergencySub} coach="cash-emergency" onClick={() => actions.openSheet('emergency')} />
        </div>
        <p className="mt-5 text-center text-xs text-fog">{copy.disclaimer}</p>
      </div>

      {state.sheet === 'reduce' && (
        <Sheet title={c.reduceTitle} subtitle={`${c.reduceSheetSub}. Currently ${inr(p.sip.amount)} a month.`} onClose={actions.closeSheet} labelId="reduce-title">
          <ChipGroup label="Monthly amount" values={p.sip.reduceOptions} value={amount} onChange={setAmount} format={inr} />
          <Button className="mt-5 w-full" onClick={() => actions.decide('reduce', { amount })}>
            {c.reduceConfirm}
          </Button>
        </Sheet>
      )}
      {state.sheet === 'move_date' && (
        <Sheet title={c.moveTitle} subtitle={`${c.moveSheetSub}. Currently the ${ordinal(p.sip.dayOfMonth)}.`} onClose={actions.closeSheet} labelId="move-title">
          <ChipGroup label="Day of month" values={DAYS} value={day} onChange={setDay} format={ordinal} />
          <Button className="mt-5 w-full" onClick={() => actions.decide('move_date', { day })}>
            {c.moveConfirm}
          </Button>
        </Sheet>
      )}
      {state.sheet === 'emergency' && (
        <Sheet title={c.emergencyTitle} onClose={actions.closeSheet} labelId="emergency-title">
          <ul className="space-y-3">
            {c.emergencyLines.map((l) => (
              <li key={l} className="flex gap-3 text-[15px] text-mist">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fog" aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-5 w-full" onClick={actions.closeSheet}>
            {copy.sip.close}
          </Button>
        </Sheet>
      )}
    </>
  )
}
