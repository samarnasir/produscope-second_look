import { copy } from '../../content/copy'
import { inr, inrLakh } from '../../lib/format'
import type { Flow } from '../../state/flow'
import { Footer } from '../shell/AppShell'
import { Button, Card, Chip } from '../shell/ui'
import { Sheet } from '../shell/Sheet'

export function SipDetail({ flow }: { flow: Flow }) {
  const { profile: p, state, actions } = flow
  const paused = state.sip.status === 'paused'
  const perf = p.performancePct
  return (
    <>
      <div className="px-5 pb-6 pt-5">
        <h1 className="text-2xl font-bold text-paper">{copy.sip.title}</h1>

        <Card className="mt-4 overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-paper">{p.sip.fund}</h2>
                <p className="text-sm text-fog">Since {p.sip.startedLabel}</p>
              </div>
              <Chip tone={paused ? 'muted' : 'blue'}>{state.sip.chip}</Chip>
            </div>

            <p className="mt-4 text-[34px] font-bold leading-none tracking-tight text-paper">
              {inr(state.sip.amount)}
              <span className="ml-1 text-base font-medium text-fog">/ month</span>
            </p>
            <p className="mt-1 text-sm text-mist">
              {paused ? 'Resumes' : 'Next instalment'} {state.sip.nextLabel}
            </p>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-graphite pt-4 text-sm">
              <div>
                <dt className="text-xs text-fog">Invested</dt>
                <dd className="mt-0.5 font-semibold text-paper">{inrLakh(p.invested)}</dd>
              </div>
              <div>
                <dt className="text-xs text-fog">Value today</dt>
                <dd className="mt-0.5 font-semibold text-paper">{inrLakh(p.value)}</dd>
              </div>
              <div>
                <dt className="text-xs text-fog">Performance</dt>
                <dd className="mt-0.5">
                  <Chip>{perf > 0 ? '+' : '−'}{Math.abs(perf)}%</Chip>
                </dd>
              </div>
            </dl>

            {p.goal && (
              <div className="mt-5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-paper">{p.goal.short}</span>
                  <span className="text-fog">{p.goal.dateLabel}</span>
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5"
                  role="progressbar"
                  aria-valuenow={Math.round((p.value * 100) / p.goal.amount)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress to goal"
                >
                  <div className="h-full rounded-full bg-paper" style={{ width: `${(p.value * 100) / p.goal.amount}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-mist">24% of the way to your goal</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Footer>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          {paused ? (
            <Button onClick={actions.resume}>{copy.sip.resume}</Button>
          ) : (
            <Button onClick={actions.tapPause}>{copy.sip.pause}</Button>
          )}
          <Button variant="outline" onClick={() => actions.openSheet('stop')} className="px-6">
            {copy.sip.stop}
          </Button>
        </div>
      </Footer>

      {state.sheet === 'stop' && (
        <Sheet title={copy.sip.stopTitle} onClose={actions.closeSheet} labelId="stop-title">
          <p className="text-[15px] text-mist">{copy.sip.stopBody}</p>
          <Button className="mt-5 w-full" onClick={actions.closeSheet}>
            {copy.sip.close}
          </Button>
        </Sheet>
      )}
    </>
  )
}
