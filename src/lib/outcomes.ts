import type { Choice, ChoiceDetail, Profile } from '../data/types'
import { inr, ordinal } from './format'
import { market } from '../data/marketContext'

export type SipStatus = 'active' | 'paused' | 'reminder_set' | 'skipped' | 'reduced' | 'date_moved'

export interface Outcome {
  status: SipStatus
  amount: number
  nextLabel: string
  /** Short status chip text on the SIP card. */
  chip: string
  headline: string
  body: string
  checkin: { title: string; body: string; status: string }
}

const monthOf = (label: string) => label.split(' ').slice(1).join(' ')

/** What each choice does to the SIP, and the copy that goes with it. */
export function outcomeFor(p: Profile, choice: Choice, detail: ChoiceDetail = {}): Outcome {
  const s = p.sip
  const base = { amount: s.amount, nextLabel: s.nextLabel }
  switch (choice) {
    case 'continue':
      return {
        ...base,
        status: 'active',
        chip: 'Active',
        headline: 'Your SIP stays active.',
        body: `Next instalment ${s.nextLabel}.`,
        checkin: {
          title: '30-day check-in',
          body: 'Last time, you chose to keep your SIP running during the market fall.',
          status: 'SIP still running',
        },
      }
    case 'pause_1m':
      return {
        ...base,
        status: 'paused',
        nextLabel: s.resume1mLabel,
        chip: `Paused until ${s.resume1mLabel}`,
        headline: 'Paused for 1 month.',
        body: `Your ${s.nextLabel} instalment is skipped. The SIP resumes ${s.resume1mLabel}.`,
        checkin: {
          title: '30-day check-in',
          body: `Last time, you paused your SIP for 1 month. It resumes ${s.resume1mLabel}.`,
          status: `Pause ends ${s.resume1mLabel}`,
        },
      }
    case 'pause_anyway':
      return {
        ...base,
        status: 'paused',
        nextLabel: s.resume6mLabel,
        chip: `Paused until ${s.resume6mLabel}`,
        headline: 'Your SIP pause has been recorded.',
        body: `Paused for ${market.pauseMonths} months. The SIP resumes ${s.resume6mLabel}.`,
        checkin: {
          title: '30-day check-in',
          body: `Last time, you paused your SIP. It stays paused until ${s.resume6mLabel}.`,
          status: 'SIP paused',
        },
      }
    case 'remind_48h':
      return {
        ...base,
        status: 'reminder_set',
        chip: `Active · reminder ${s.reminderLabel}`,
        headline: `Reminder set for ${s.reminderLabel}.`,
        body: 'Your SIP has not been paused. You can pause any time before then.',
        checkin: {
          title: '30-day check-in',
          body: 'Last time, you asked for a reminder before deciding. Your SIP kept running.',
          status: 'SIP still running',
        },
      }
    case 'skip_1':
      return {
        ...base,
        status: 'skipped',
        nextLabel: s.resume1mLabel,
        chip: `${s.nextLabel} skipped`,
        headline: 'One instalment skipped.',
        body: `Your ${s.nextLabel} instalment of ${inr(s.amount)} is skipped. The SIP continues ${s.resume1mLabel}.`,
        checkin: {
          title: '30-day check-in',
          body: `Last time, you skipped one instalment. Your SIP runs again from ${s.resume1mLabel}.`,
          status: 'SIP running',
        },
      }
    case 'reduce': {
      const amount = detail.amount ?? s.reduceOptions[0]
      return {
        ...base,
        status: 'reduced',
        amount,
        chip: `Reduced to ${inr(amount)}`,
        headline: `SIP reduced to ${inr(amount)} a month.`,
        body: `From your next instalment on ${s.nextLabel}, ${inr(amount)} is invested each month instead of ${inr(s.amount)}.`,
        checkin: {
          title: '30-day check-in',
          body: `Last time, you reduced your SIP to ${inr(amount)} a month.`,
          status: `SIP running at ${inr(amount)}`,
        },
      }
    }
    case 'move_date': {
      const day = detail.day ?? 15
      const next = `${day} ${monthOf(s.nextLabel)}`
      return {
        ...base,
        status: 'date_moved',
        nextLabel: next,
        chip: `Now on the ${ordinal(day)}`,
        headline: `SIP date moved to the ${ordinal(day)}.`,
        body: `Your next instalment is ${next}. It was due on the ${ordinal(s.dayOfMonth)}.`,
        checkin: {
          title: '30-day check-in',
          body: `Last time, you moved your SIP date to the ${ordinal(day)}.`,
          status: 'SIP running',
        },
      }
    }
  }
}
