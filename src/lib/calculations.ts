import type { Profile } from '../data/types'
import { market } from '../data/marketContext'

/**
 * Deterministic calculation engine. Every number shown in the UI comes from here
 * (or from a fixture labelled illustrative). Nothing in this file calls a model.
 */

export const monthlyRate = (annual: number) => Math.pow(1 + annual, 1 / 12) - 1

interface ProjectArgs {
  corpus: number
  sip: number
  months: number
  /** Number of leading instalments skipped. */
  skip: number
  annualReturn: number
}

/** Instalment added at the start of each month, then the month's growth is applied. */
export function projectValue({ corpus, sip, months, skip, annualReturn }: ProjectArgs): number {
  const r = monthlyRate(annualReturn)
  let v = corpus
  for (let m = 0; m < months; m++) {
    if (m >= skip) v += sip
    v *= 1 + r
  }
  return v
}

/** First month count at which the projected value reaches the target. */
export function monthsToTarget(args: Omit<ProjectArgs, 'months'> & { target: number }, cap = 360): number {
  for (let m = 0; m <= cap; m++) {
    if (projectValue({ ...args, months: m }) >= args.target) return m
  }
  return cap
}

export const unitsMorePct = (navBase: number, navNow: number) => Math.round((navBase / navNow - 1) * 100)

export const roundTo = (n: number, step: number) => Math.round(n / step) * step

export interface ImpactNumbers {
  pauseMonths: number
  /** Contributions not invested during the pause. */
  missed: number
  valueKeep: number
  valuePause: number
  impactRaw: number
  /** Rounded to the nearest ₹1,000 for display. */
  impact: number
  /** Pause scenario as % of keep-going scenario at the end of the horizon. */
  barPausePct: number
  hasGoal: boolean
  goalAmount: number | null
  /** Months later the goal is reached. Null when the investor has no goal. */
  delayMonths: number | null
  monthsToGoalKeep: number | null
  monthsToGoalPause: number | null
  horizonMonths: number
  unitsMorePct: number
  progressPct: number | null
}

export function computeImpact(p: Profile): ImpactNumbers {
  const base = {
    corpus: p.value,
    sip: p.sip.amount,
    annualReturn: market.annualReturn,
  }
  const pauseMonths = market.pauseMonths
  const valueKeep = projectValue({ ...base, months: p.horizonMonths, skip: 0 })
  const valuePause = projectValue({ ...base, months: p.horizonMonths, skip: pauseMonths })
  const impactRaw = valueKeep - valuePause

  let monthsToGoalKeep: number | null = null
  let monthsToGoalPause: number | null = null
  if (p.goal) {
    monthsToGoalKeep = monthsToTarget({ ...base, skip: 0, target: p.goal.amount })
    monthsToGoalPause = monthsToTarget({ ...base, skip: pauseMonths, target: p.goal.amount })
  }

  return {
    pauseMonths,
    missed: p.sip.amount * pauseMonths,
    valueKeep,
    valuePause,
    impactRaw,
    impact: roundTo(impactRaw, 1000),
    barPausePct: Math.round((valuePause / valueKeep) * 100),
    hasGoal: !!p.goal,
    goalAmount: p.goal?.amount ?? null,
    delayMonths: monthsToGoalKeep !== null && monthsToGoalPause !== null ? monthsToGoalPause - monthsToGoalKeep : null,
    monthsToGoalKeep,
    monthsToGoalPause,
    horizonMonths: p.horizonMonths,
    unitsMorePct: unitsMorePct(market.navJuly, market.navToday),
    progressPct: p.goal ? Math.round((p.value * 100) / p.goal.amount) : null,
  }
}
