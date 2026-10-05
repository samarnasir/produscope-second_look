import type { Profile } from '../data/types'
import { market } from '../data/marketContext'
import type { ImpactNumbers } from './calculations'
import { inr, months } from './format'

export type NumberId = 'goal_impact' | 'contributions_missed' | 'goal_delay' | 'pause_bar' | 'price_today' | 'past_falls' | 'all'

export interface NumberSource {
  id: Exclude<NumberId, 'all'>
  label: string
  source: string
  how: string
}

export const DATA_LINE = 'AMFI NAV history, investor portfolio, goal'
export const ASSUMPTION_LINE = `${Math.round(market.annualReturn * 100)}% annual return; SIP resumes after ${market.pauseMonths} months`
export const RECOVERY_NOTE = 'Historical recovery figures shown illustratively.'
export const UPDATED_LINE = market.updatedAt

/** Every number on the card maps to a source and a calculation. */
export function numberSources(p: Profile, n: ImpactNumbers): NumberSource[] {
  const horizon = p.goal ? `${p.goal.dateLabel}` : `${Math.round(n.horizonMonths / 12)} years`
  const pct = Math.round(market.annualReturn * 100)
  return [
    {
      id: 'contributions_missed',
      label: `${inr(n.missed)} not invested`,
      source: 'Your SIP amount',
      how: `${inr(p.sip.amount)} × ${n.pauseMonths} instalments = ${inr(n.missed)}.`,
    },
    {
      id: 'goal_impact',
      label: p.goal ? `${inr(n.impact)} less by ${horizon}` : `${inr(n.impact)} lower in ${horizon}`,
      source: 'Your portfolio value, SIP and calculation engine',
      how: `Start from ${inr(p.value)} today, add ${inr(p.sip.amount)} a month, grow at ${pct}% a year to ${horizon}. Keeping the SIP running gives ${inr(n.valueKeep)}; pausing ${months(n.pauseMonths)} gives ${inr(n.valuePause)}. Difference: ${inr(n.impactRaw)}, shown as ${inr(n.impact)}.`,
    },
    ...(p.goal && n.delayMonths !== null && n.monthsToGoalKeep !== null && n.monthsToGoalPause !== null
      ? ([
          {
            id: 'goal_delay',
            label: `About ${months(n.delayMonths)} later`,
            source: 'Your goal and calculation engine',
            how: `Same projection, month by month. It reaches ${inr(p.goal.amount)} after ${months(n.monthsToGoalKeep)} if you keep going and after ${months(n.monthsToGoalPause)} if you pause ${months(n.pauseMonths)}. The gap is ${months(n.delayMonths)}.`,
          },
        ] as NumberSource[])
      : []),
    {
      id: 'pause_bar',
      label: `Keep going 100% vs Pause ${months(n.pauseMonths)} ${n.barPausePct}%`,
      source: 'Calculation engine',
      how: `${inr(n.valuePause)} ÷ ${inr(n.valueKeep)} = ${n.barPausePct}%. A scenario comparison, not a forecast.`,
    },
    {
      id: 'price_today',
      label: `${n.unitsMorePct}% more units than in July`,
      source: 'AMFI NAV history',
      how: `NAV was ₹${market.navJuly.toFixed(2)} in July and is ₹${market.navToday.toFixed(2)} today. ₹${market.navJuly.toFixed(2)} ÷ ₹${market.navToday.toFixed(2)} = ${(market.navJuly / market.navToday).toFixed(2)}, so the same ${inr(p.sip.amount)} buys ${n.unitsMorePct}% more units. This describes today's price level, not what happens next.`,
    },
    {
      id: 'past_falls',
      label: `Median ~${market.recovery.medianMonths} months · slowest ~${market.recovery.slowestMonths} months`,
      source: 'Flexi-cap category drawdown history (illustrative)',
      how: 'Illustrative historical range for flexi-cap funds; varies by drawdown and fund. These figures are not calculated live and past recoveries do not predict future ones.',
    },
  ]
}
