/** Mock, user-authorised market context. Fixed so the demo is deterministic. */
export const market = {
  today: '5 Oct 2026',
  updatedAt: '1 Oct 2026',
  annualReturn: 0.11,
  pauseMonths: 6,
  marketFallPct: 12,
  navJuly: 100.0,
  navToday: 87.7,
  /** Illustrative historical range for flexi-cap drawdowns. NOT computed. */
  recovery: { medianMonths: 8, slowestMonths: 18 },
} as const
