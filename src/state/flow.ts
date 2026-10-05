import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { Choice, ChoiceDetail, Profile, Reason, UserId } from '../data/types'
import { riya } from '../data/riya'
import { arjun } from '../data/arjun'
import { outcomeFor, type SipStatus } from '../lib/outcomes'
import { cardFor } from '../lib/rules'
import { trackEvent, resetEvents } from '../lib/analytics'
import type { NumberId } from '../lib/explainability'

export type Step = 'landing' | 'sip_detail' | 'reason' | 'fear' | 'cash' | 'decision' | 'confirmed' | 'checkin'
export type Sheet = 'stop' | 'v2' | 'reduce' | 'move_date' | 'emergency' | 'demo' | null

export interface State {
  user: UserId
  step: Step
  reason?: Reason
  choice?: Choice
  choiceDetail?: ChoiceDetail
  whyOpen: NumberId | null
  sheet: Sheet
  sip: { status: SipStatus; amount: number; nextLabel: string; chip: string }
}

const PROFILES: Record<UserId, Profile> = { riya, arjun }

const freshSip = (p: Profile): State['sip'] => ({
  status: 'active',
  amount: p.sip.amount,
  nextLabel: p.sip.nextLabel,
  chip: 'Active',
})

const initial = (user: UserId = 'riya'): State => ({
  user,
  step: 'landing',
  whyOpen: null,
  sheet: null,
  sip: freshSip(PROFILES[user]),
})

type Action =
  | { type: 'start'; user: UserId }
  | { type: 'goto'; step: Step }
  | { type: 'reason'; reason: Reason }
  | { type: 'why'; id: NumberId | null }
  | { type: 'sheet'; sheet: Sheet }
  | { type: 'decide'; choice: Choice; detail?: ChoiceDetail }
  | { type: 'resume' }
  | { type: 'reset' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...initial(a.user), step: 'sip_detail' }
    case 'goto':
      return guard({ ...s, step: a.step, whyOpen: null, sheet: null })
    case 'reason':
      if (a.reason === 'fund_doubt') return { ...s, reason: a.reason, sheet: 'v2' }
      return { ...s, reason: a.reason, step: cardFor(a.reason) as Step, sheet: null }
    case 'why':
      return { ...s, whyOpen: a.id }
    case 'sheet':
      return { ...s, sheet: a.sheet }
    case 'decide': {
      const o = outcomeFor(PROFILES[s.user], a.choice, a.detail)
      return {
        ...s,
        choice: a.choice,
        choiceDetail: a.detail,
        step: 'confirmed',
        sheet: null,
        whyOpen: null,
        sip: { status: o.status, amount: o.amount, nextLabel: o.nextLabel, chip: o.chip },
      }
    }
    case 'resume':
      return { ...s, sip: freshSip(PROFILES[s.user]), choice: undefined, choiceDetail: undefined, reason: undefined }
    case 'reset':
      return initial('riya')
  }
}

/** Keeps the machine reachable only via real paths (browser Back / pasted hash). */
function guard(s: State): State {
  const needsReason: Step[] = ['fear', 'cash', 'decision']
  const needsChoice: Step[] = ['confirmed', 'checkin']
  if (s.step !== 'landing' && s.step !== 'sip_detail' && s.step !== 'reason') {
    if (needsReason.includes(s.step) && !s.reason) return { ...s, step: 'sip_detail' }
    if (needsChoice.includes(s.step) && !s.choice) return { ...s, step: 'sip_detail' }
  }
  return s
}

const STEPS: Step[] = ['landing', 'sip_detail', 'reason', 'fear', 'cash', 'decision', 'confirmed', 'checkin']
const stepFromHash = (): Step => {
  const h = window.location.hash.replace('#/', '').replace('#', '') as Step
  return STEPS.includes(h) ? h : 'landing'
}

export function useFlow() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ ...initial(), step: 'landing' as Step }))
  const profile = PROFILES[state.user]

  // Step ↔ hash, so the browser Back button walks the flow.
  const fromPop = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {
    const target = `#/${state.step}`
    if (window.location.hash !== target) {
      if (!mounted.current || fromPop.current) window.history.replaceState(null, '', target)
      else window.history.pushState(null, '', target)
    }
    mounted.current = true
    fromPop.current = false
  }, [state.step])
  useEffect(() => {
    const onPop = () => {
      fromPop.current = true
      dispatch({ type: 'goto', step: stepFromHash() })
      setTimeout(() => (fromPop.current = false), 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // card_viewed: dwell time on the fear / cash card.
  const enteredAt = useRef<{ step: Step; t: number } | null>(null)
  useEffect(() => {
    const prev = enteredAt.current
    if (prev && prev.step !== state.step && (prev.step === 'fear' || prev.step === 'cash')) {
      trackEvent('card_viewed', {
        card_id: prev.step === 'fear' ? 'fear_card' : 'cash_card',
        time_ms: Math.round(performance.now() - prev.t),
      })
    }
    if (!prev || prev.step !== state.step) enteredAt.current = { step: state.step, t: performance.now() }
  }, [state.step])

  const actions = useMemo(
    () => ({
      start: (user: UserId) => {
        resetEvents()
        dispatch({ type: 'start', user })
      },
      tapPause: () => {
        trackEvent('pause_tapped', { sip_id: profile.sip.id, amount: state.sip.amount })
        dispatch({ type: 'goto', step: 'reason' })
      },
      selectReason: (reason: Reason) => {
        trackEvent('reason_selected', { reason })
        dispatch({ type: 'reason', reason })
      },
      goto: (step: Step) => dispatch({ type: 'goto', step }),
      openWhy: (id: NumberId) => {
        trackEvent('why_opened', { number_id: id })
        dispatch({ type: 'why', id })
      },
      closeWhy: () => dispatch({ type: 'why', id: null }),
      openSheet: (sheet: Sheet) => dispatch({ type: 'sheet', sheet }),
      closeSheet: () => dispatch({ type: 'sheet', sheet: null }),
      decide: (choice: Choice, detail?: ChoiceDetail) => {
        trackEvent('decision_made', { choice, reason: state.reason ?? null, ...(detail ?? {}) })
        dispatch({ type: 'decide', choice, detail })
      },
      openCheckin: () => {
        trackEvent('decision_state_90d', { still_standing: true, simulated: true })
        dispatch({ type: 'goto', step: 'checkin' })
      },
      resume: () => dispatch({ type: 'resume' }),
      reset: () => {
        resetEvents()
        dispatch({ type: 'reset' })
      },
    }),
    [profile, state.sip.amount, state.reason],
  )

  const back = useCallback(() => window.history.back(), [])
  return { state, profile, actions, back }
}

export type Flow = ReturnType<typeof useFlow>
