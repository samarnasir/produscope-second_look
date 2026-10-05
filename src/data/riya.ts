import type { Profile } from './types'

export const riya: Profile = {
  id: 'riya',
  name: 'Riya Sharma',
  firstName: 'Riya',
  photo: '/avatars/riya.jpg',
  age: 27,
  city: 'Pune',
  occupation: 'Software Tester',
  sip: {
    id: 'riya-flexicap-5000',
    fund: 'Flexi-cap fund',
    amount: 5000,
    startedLabel: 'Mar 2024',
    dayOfMonth: 10,
    nextLabel: '10 Oct',
    resume1mLabel: '10 Nov',
    resume6mLabel: '10 Apr 2027',
    reminderLabel: '7 Oct',
    reduceOptions: [1000, 2000, 3000],
  },
  invested: 155000,
  value: 141000,
  performancePct: -9,
  goal: { name: 'home goal', short: '₹6 lakh home down payment', amount: 600000, dateLabel: 'Mar 2031' },
  /** 53 monthly instalments from 10 Oct 2026, valued on 10 Mar 2031. */
  horizonMonths: 53,
  behaviour: { firstDrawdown: true, lateRestarts: 0 },
  persona: {
    says: 'Everyone online says the market will crash further.',
    thinks: "If I pause now, I'll stop the bleeding.",
    does: 'Opens the app 3–4 times a day when markets drop; watches finfluencer reels at night.',
    feels: 'Anxious, alone, unsure whom to trust.',
  },
}
