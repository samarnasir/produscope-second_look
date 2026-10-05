import { describe, expect, it } from 'vitest'
import { riya } from '../data/riya'
import { arjun } from '../data/arjun'
import { market } from '../data/marketContext'
import { computeImpact, monthlyRate, monthsToTarget, projectValue, unitsMorePct } from '../lib/calculations'
import { inr, inrLakh } from '../lib/format'

describe('engine: Riya, 6-month pause', () => {
  const n = computeImpact(riya)

  it('contributions not invested', () => expect(n.missed).toBe(30000))
  it('projected values at goal date', () => {
    expect(Math.round(n.valueKeep)).toBe(561671)
    expect(Math.round(n.valuePause)).toBe(515123)
  })
  it('goal impact rounds to ₹47,000', () => {
    expect(Math.round(n.impactRaw)).toBe(46548)
    expect(n.impact).toBe(47000)
  })
  it('goal is reached about 5 months later', () => {
    expect(n.monthsToGoalKeep).toBe(57)
    expect(n.monthsToGoalPause).toBe(62)
    expect(n.delayMonths).toBe(5)
  })
  it('pause bar is 92% of keep-going', () => expect(n.barPausePct).toBe(92))
  it('price context is 14% more units', () => expect(n.unitsMorePct).toBe(14))
  it('progress to goal is 24%', () => expect(n.progressPct).toBe(24))
  it('is reproducible', () => expect(computeImpact(riya)).toEqual(n))
})

describe('engine: building blocks', () => {
  it('monthly rate compounds to the annual rate', () => {
    expect(Math.pow(1 + monthlyRate(0.11), 12)).toBeCloseTo(1.11, 10)
  })
  it('no skipping never lowers the value', () => {
    const a = { corpus: 100000, sip: 5000, months: 24, annualReturn: 0.11 }
    expect(projectValue({ ...a, skip: 0 })).toBeGreaterThan(projectValue({ ...a, skip: 6 }))
  })
  it('monthsToTarget is monotonic in the pause length', () => {
    const a = { corpus: 141000, sip: 5000, annualReturn: 0.11, target: 600000 }
    expect(monthsToTarget({ ...a, skip: 6 })).toBeGreaterThan(monthsToTarget({ ...a, skip: 0 }))
  })
  it('units delta', () => expect(unitsMorePct(100, 87.7)).toBe(14))
  it('uses the deck assumptions', () => {
    expect(market.annualReturn).toBe(0.11)
    expect(market.pauseMonths).toBe(6)
    expect(market.updatedAt).toBe('1 Oct 2026')
    expect(market.recovery).toEqual({ medianMonths: 8, slowestMonths: 18 })
  })
})

describe('engine: investor without a goal', () => {
  const n = computeImpact(arjun)
  it('has no delay or goal progress', () => {
    expect(n.hasGoal).toBe(false)
    expect(n.delayMonths).toBeNull()
    expect(n.progressPct).toBeNull()
  })
  it('still computes the value impact', () => {
    expect(n.missed).toBe(48000)
    expect(n.impact).toBeGreaterThan(0)
  })
})

describe('format', () => {
  it('rupees with Indian grouping', () => expect(inr(47000)).toBe('₹47,000'))
  it('lakh', () => {
    expect(inrLakh(155000)).toBe('₹1.55 lakh')
    expect(inrLakh(141000)).toBe('₹1.41 lakh')
    expect(inrLakh(600000)).toBe('₹6 lakh')
  })
})
