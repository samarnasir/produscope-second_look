import type { Profile, Reason } from '../data/types'
import type { ImpactNumbers } from './calculations'
import { inr, months } from './format'

/**
 * AI explainer layer. It only turns engine output into plain language; it never produces a number.
 * The prototype uses deterministic templates so the demo cannot fail. A hosted model could replace
 * `generate` later: its output would still go through `passesGuardrail`, with the template as fallback.
 */

const BANNED: RegExp[] = [
  /you should/i,
  /should continue/i,
  /invest more/i,
  /buy now/i,
  /buying opportunity/i,
  /don'?t sell/i,
  /do not sell/i,
  /will recover/i,
  /will go up/i,
  /guarantee/i,
  /best choice/i,
  /smartest/i,
  /recommend/i,
  /\bAI says\b/i,
  /our algorithm/i,
  /mistake/i,
  /are you sure/i,
]

export const passesGuardrail = (text: string) => !BANNED.some((re) => re.test(text))

export interface ExplainInput {
  profile: Profile
  numbers: ImpactNumbers
  reason: Reason
}

export type Generator = (i: ExplainInput) => string

export function templateFallback({ numbers: n, profile }: ExplainInput): string {
  const target = profile.goal ? `your ${profile.goal.name}` : 'your investments'
  return `Pausing ${months(n.pauseMonths)} means ${inr(n.missed)} less invested, and ${target} ends about ${inr(n.impact)} lower.`
}

export const templateGenerator: Generator = ({ numbers: n, profile, reason }) => {
  if (reason === 'need_cash') {
    return `Skipping, reducing or moving your SIP date each free up cash. Pausing ${months(n.pauseMonths)} would mean ${inr(n.missed)} less invested.`
  }
  if (profile.goal && n.delayMonths !== null) {
    return `Pausing could leave your ${profile.goal.name} about ${inr(n.impact)} short and push it roughly ${months(n.delayMonths)} later.`
  }
  return `Pausing could leave your investments about ${inr(n.impact)} lower in ${Math.round(n.horizonMonths / 12)} years.`
}

/** Runs the generator, then the advice-phrase filter. Falls back to the template if either fails. */
export function explain(input: ExplainInput, generate: Generator = templateGenerator): string {
  try {
    const out = generate(input)
    if (out && passesGuardrail(out)) return out
  } catch {
    /* fall through to template */
  }
  return templateFallback(input)
}
