import { copy } from '../../content/copy'
import { outcomeFor } from '../../lib/outcomes'
import type { Flow } from '../../state/flow'
import { Button, Card } from '../shell/ui'
import { Footer } from '../shell/AppShell'

export function Confirmation({ flow }: { flow: Flow }) {
  const { profile, state, actions } = flow
  const o = outcomeFor(profile, state.choice!, state.choiceDetail)
  return (
    <>
      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-12 text-center">
        <div className="grid size-20 animate-pop place-items-center rounded-full bg-pulse-green/15" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M10 21l7 7 13-15"
              stroke="#27a644"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              className="animate-draw"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-[30px] font-bold text-paper">{copy.confirm.title}</h1>
        <p className="mt-0.5 text-sm font-semibold text-pulse-green">{copy.confirm.saved}</p>

        <div data-coach="outcome" className="mt-6 animate-rise">
          <p className="text-lg font-semibold text-paper" data-testid="outcome-headline">
            {o.headline}
          </p>
          <p className="mt-1 text-[15px] text-mist" data-testid="outcome-body">
            {o.body}
          </p>
        </div>

        <Card className="mt-6 w-full bg-white/[0.03] p-4 text-left">
          <p className="text-sm font-bold text-paper">{copy.confirm.checkinTitle}</p>
          <p className="mt-0.5 text-sm text-mist">{copy.confirm.checkinBody}</p>
        </Card>
      </div>
      <Footer>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => actions.goto('sip_detail')}>{copy.confirm.done}</Button>
          <Button variant="outline" onClick={actions.openCheckin}>
            {copy.confirm.preview}
          </Button>
        </div>
      </Footer>
    </>
  )
}
