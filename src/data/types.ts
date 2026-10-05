export type UserId = 'riya' | 'arjun'

export interface Profile {
  id: UserId
  name: string
  firstName: string
  age: number
  city: string
  occupation: string
  sip: {
    id: string
    fund: string
    amount: number
    startedLabel: string
    dayOfMonth: number
    nextLabel: string
    resume1mLabel: string
    resume6mLabel: string
    reminderLabel: string
    reduceOptions: number[]
  }
  invested: number
  value: number
  performancePct: number
  goal: { name: string; short: string; amount: number; dateLabel: string } | null
  /** Months of instalments projected forward (to the goal date, or 5 years when there is no goal). */
  horizonMonths: number
  behaviour: { firstDrawdown: boolean; lateRestarts: number }
  cashNeed?: { amount: number; reason: string }
  persona: { says: string; thinks: string; does: string; feels: string }
}

export type Reason = 'market_falling' | 'need_cash' | 'just_pause' | 'fund_doubt'
export type Choice =
  | 'continue'
  | 'pause_1m'
  | 'remind_48h'
  | 'pause_anyway'
  | 'skip_1'
  | 'reduce'
  | 'move_date'
export interface ChoiceDetail {
  amount?: number
  day?: number
}
