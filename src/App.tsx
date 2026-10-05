import { useFlow } from './state/flow'
import { useTour } from './state/tour'
import { AppShell } from './components/shell/AppShell'
import { Landing } from './components/landing/Landing'
import { SipDetail } from './components/sip/SipDetail'
import { ReasonPicker, V2Sheet } from './components/reason-picker/ReasonPicker'
import { FearCard } from './components/context-card/FearCard'
import { WhySheet } from './components/explainability/WhySheet'
import { DecisionScreen } from './components/decision/DecisionScreen'
import { CashCard } from './components/cash-flow/CashCard'
import { Confirmation } from './components/confirmation/Confirmation'
import { CheckIn30 } from './components/confirmation/CheckIn30'
import { ContextPanel } from './components/demo/ContextPanel'
import { Sheet } from './components/shell/Sheet'
import { copy } from './content/copy'

export default function App() {
  const flow = useFlow()
  const tour = useTour()
  const { state, actions } = flow

  return (
    <AppShell flow={flow} tour={tour}>
      {state.step === 'landing' && <Landing flow={flow} />}
      {(state.step === 'sip_detail' || state.step === 'reason') && <SipDetail flow={flow} />}
      {state.step === 'reason' && (state.sheet === 'v2' ? <V2Sheet flow={flow} /> : <ReasonPicker flow={flow} />)}
      {state.step === 'fear' && <FearCard flow={flow} />}
      {state.step === 'cash' && <CashCard flow={flow} />}
      {state.step === 'decision' && <DecisionScreen flow={flow} />}
      {state.step === 'confirmed' && state.choice && <Confirmation flow={flow} />}
      {state.step === 'checkin' && state.choice && <CheckIn30 flow={flow} />}

      {state.whyOpen && <WhySheet flow={flow} focus={state.whyOpen} />}
      {state.sheet === 'demo' && (
        <Sheet title={copy.panel.title} onClose={actions.closeSheet} labelId="demo-title">
          <ContextPanel flow={flow} />
        </Sheet>
      )}
    </AppShell>
  )
}
