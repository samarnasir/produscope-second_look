export type EventName =
  | 'pause_tapped'
  | 'reason_selected'
  | 'card_viewed'
  | 'why_opened'
  | 'decision_made'
  | 'decision_state_90d'

export interface TrackedEvent {
  id: number
  name: EventName
  payload: Record<string, unknown>
  ts: number
  session_id: string
}

const session_id = Math.random().toString(36).slice(2, 10)
let events: TrackedEvent[] = []
let counter = 0
const listeners = new Set<() => void>()

/** Local-only analytics. Demonstrates the instrumentation in the deck (slide 13); sends nothing anywhere. */
export function trackEvent(name: EventName, payload: Record<string, unknown> = {}) {
  const e: TrackedEvent = { id: ++counter, name, payload, ts: Date.now(), session_id }
  events = [e, ...events].slice(0, 50)
  console.info('[second-look]', name, payload)
  listeners.forEach((l) => l())
}

export const getEvents = () => events
export const resetEvents = () => {
  events = []
  listeners.forEach((l) => l())
}
export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}
