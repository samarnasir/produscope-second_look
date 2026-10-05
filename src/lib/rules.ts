import type { Profile, Reason } from '../data/types'

export type CardId = 'fear' | 'cash' | 'decision' | 'v2'

/** Reason classifier: the chip decides which card appears. */
export function cardFor(reason: Reason): CardId {
  switch (reason) {
    case 'market_falling':
      return 'fear'
    case 'need_cash':
      return 'cash'
    case 'just_pause':
      return 'decision'
    case 'fund_doubt':
      return 'v2'
  }
}

/** Past behaviour decides whether the 48-hour reminder is offered. Cash-driven pauses never get it. */
export function show48h(p: Profile, reason: Reason | undefined): boolean {
  if (reason === 'need_cash') return false
  return p.behaviour.firstDrawdown || p.behaviour.lateRestarts > 0
}
