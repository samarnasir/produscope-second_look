import { describe, expect, it } from 'vitest'
import { copy } from '../content/copy'
import { riya } from '../data/riya'
import { arjun } from '../data/arjun'
import { computeImpact } from '../lib/calculations'
import { explain, passesGuardrail, templateGenerator } from '../lib/explainer'
import { numberSources } from '../lib/explainability'
import { outcomeFor } from '../lib/outcomes'
import type { Choice, Profile, Reason } from '../data/types'

function flatten(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => flatten(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => flatten(x, out))
  else if (typeof v === 'function') {
    // dynamic copy takes plain values; call with sample args
    const f = v as (...a: unknown[]) => unknown
    out.push(String(f(14, '₹5,000', '10 Nov')))
  }
  return out
}

const reasons: Reason[] = ['market_falling', 'need_cash', 'just_pause']
const choices: Choice[] = ['continue', 'pause_1m', 'remind_48h', 'pause_anyway', 'skip_1', 'reduce', 'move_date']

function allGenerated(p: Profile): string[] {
  const n = computeImpact(p)
  const out: string[] = []
  reasons.forEach((reason) => out.push(explain({ profile: p, numbers: n, reason })))
  numberSources(p, n).forEach((s) => out.push(s.label, s.source, s.how))
  choices.forEach((c) => {
    const o = outcomeFor(p, c, { amount: p.sip.reduceOptions[0], day: 20 })
    out.push(o.chip, o.headline, o.body, o.checkin.title, o.checkin.body, o.checkin.status)
  })
  return out
}

describe('advice guardrail', () => {
  it('flags advice-like phrases', () => {
    for (const bad of [
      'You should continue your SIP',
      'This is a buying opportunity',
      'The market will recover soon',
      'Guaranteed returns',
      'Are you sure?',
      'Our algorithm recommends this fund',
      "Don't sell now",
    ]) {
      expect(passesGuardrail(bad), bad).toBe(false)
    }
  })

  it('every static UI string is clean', () => {
    for (const s of flatten(copy)) expect(passesGuardrail(s), s).toBe(true)
  })

  it('every generated string is clean for both personas', () => {
    for (const s of [...allGenerated(riya), ...allGenerated(arjun)]) expect(passesGuardrail(s), s).toBe(true)
  })

  it('falls back to the template when a generator produces advice', () => {
    const n = computeImpact(riya)
    const out = explain({ profile: riya, numbers: n, reason: 'market_falling' }, () => 'You should keep investing.')
    expect(passesGuardrail(out)).toBe(true)
    expect(out).toContain('₹47,000')
  })

  it('falls back when the generator throws', () => {
    const out = explain({ profile: riya, numbers: computeImpact(riya), reason: 'market_falling' }, () => {
      throw new Error('model down')
    })
    expect(out).toContain('₹30,000')
  })

  it('template output matches the deck wording', () => {
    const out = templateGenerator({ profile: riya, numbers: computeImpact(riya), reason: 'market_falling' })
    expect(out).toBe('Pausing could leave your home goal about ₹47,000 short and push it roughly 5 months later.')
  })
})
