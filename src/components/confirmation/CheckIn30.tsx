import { copy } from '../../content/copy'
import { outcomeFor } from '../../lib/outcomes'
import type { Flow } from '../../state/flow'
import { Button, Card, Chip } from '../shell/ui'
import { Footer } from '../shell/AppShell'

export function CheckIn30({ flow }: { flow: Flow }) {
  const { profile, state, actions } = flow
  const o = outcomeFor(profile, state.choice!, state.choiceDetail)
  return (
    <>
      <div className="px-5 pb-6 pt-8">
        <p className="text-xs font-semibold text-fog">{copy.checkin.preview}</p>
        <Card coach="checkin-card" className="mt-3 overflow-hidden">
          <div className="p-5">
            <h1 className="text-2xl font-bold text-paper">{o.checkin.title}</h1>
            <p className="mt-3 text-[17px] leading-snug text-mist">{o.checkin.body}</p>
            <div className="mt-4">
              <Chip tone="blue">{o.checkin.status}</Chip>
            </div>
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-fog">{copy.disclaimer}</p>
      </div>
      <Footer>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => actions.goto('sip_detail')}>{copy.checkin.back}</Button>
          <Button variant="outline" onClick={actions.reset}>
            {copy.checkin.restart}
          </Button>
        </div>
      </Footer>
    </>
  )
}
