import type { Profile } from './types'

/** Secondary persona. Illustrative figures: the deck gives only the SIP, EMI and the medical bill. */
export const arjun: Profile = {
  id: 'arjun',
  name: 'Arjun Mehta',
  firstName: 'Arjun',
  age: 34,
  city: 'Indore',
  occupation: 'Sales Manager',
  sip: {
    id: 'arjun-largecap-8000',
    fund: 'Large-cap fund',
    amount: 8000,
    startedLabel: 'Jun 2023',
    dayOfMonth: 7,
    nextLabel: '7 Oct',
    resume1mLabel: '7 Nov',
    resume6mLabel: '7 Apr 2027',
    reminderLabel: '7 Oct',
    reduceOptions: [2000, 4000, 6000],
  },
  invested: 260000,
  value: 242000,
  performancePct: -7,
  goal: null,
  horizonMonths: 60,
  behaviour: { firstDrawdown: false, lateRestarts: 0 },
  cashNeed: { amount: 40000, reason: 'a medical bill' },
  persona: {
    says: 'A medical bill came up and the SIP date was two days away.',
    thinks: 'I need that ₹8,000 more than the fund does right now.',
    does: 'Pays a home loan EMI every month; needs ₹40,000 for a medical bill.',
    feels: 'Stressed, short on time.',
  },
}
