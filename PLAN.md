# Second Look prototype: implementation plan

Source of truth, in order:
1. Deck `IIT_Guwahati.pptx` (Team UpForge), slides 5, 7, 9, 10, 11, 13.
2. Produscope 2026 case brief (FinLit Ventures).
3. The build prompt (scope, copy rules, acceptance criteria).

This doc records decisions already made. Do not re-open them while implementing.

## 0. Decisions locked

| Topic | Decision |
|---|---|
| Stack | Vite + React 19 + TypeScript + Tailwind v4. Static build, deployed on Vercel (auto-detects Vite, no `vercel.json`). |
| Routing | No router. One `useReducer` flow machine. The current step is mirrored to `location.hash` so the browser Back button works. A fresh load or unknown hash goes to Landing. |
| AI | No LLM call. Template explainer behind an `explain()` interface, plus an advice-phrase guardrail. Deterministic, works offline, no keys. |
| Numbers | **Engine output is the truth.** The UI reads every number from `lib/calculations.ts`. The deck gets updated to match (section 9). |
| "Today" | Fixed demo date `2026-10-05` in the fixture. Never use `Date.now()` for anything shown on screen. |
| Arjun | Secondary entry on Landing. Built last (P2), only after every P0/P1 item passes. |
| Tests | Vitest for the engine and guardrail. Playwright (`@playwright/test` 1.63, Chromium at `/opt/pw-browsers`) for the flows and console errors. |

## 1. Engine numbers (verified, reproduce these exactly)

Inputs (`src/data/riya.ts`):
- Corpus today ₹1,41,000; invested ₹1,55,000 (shown as −9%).
- SIP ₹5,000, instalment at the **start** of each month, on the 10th.
- 53 months from Oct 2026 to Mar 2031.
- Annual return 11%, so monthly rate `r = 1.11^(1/12) − 1` (≈ 0.8735%).
- Pause = the next 6 instalments (Oct 2026 to Mar 2027 skipped; the SIP resumes 10 Apr 2027).
- Goal ₹6,00,000 by Mar 2031.

Formula: for each month m from 0 to 52, add the instalment (unless m < 6 in the pause scenario), then multiply by (1 + r).

| Output | Engine value | Displayed |
|---|---|---|
| contributionsMissed | 30,000 | ₹30,000 |
| valueAtGoalDate keep | 5,61,671 | (explain sheet only) |
| valueAtGoalDate pause | 5,15,123 | (explain sheet only) |
| goalImpact | 46,548 | **₹47,000** (round to nearest ₹1,000) |
| monthsTo₹6L keep / pause | 57 / 62 | **~5 months later** |
| bar pause ÷ keep | 91.7% | **Keep going 100% / Pause 6 months 92%** |
| goal progress | 1.41 ÷ 6 = 23.5% | 24% |
| unitsMoreToday | NAV July ₹100.00, today ₹87.70, so 14.0% | **14% more units** |

The recovery figures (~8 months median, ~18 months slowest) are **illustrative fixtures**, not computed. Label them that way everywhere they appear.

`calculations.test.ts` must assert every row above.

## 2. File layout

```
src/
  data/
    riya.ts            persona, SIP, goal, behaviour flags
    arjun.ts           P2
    marketContext.ts   NAV July/today, market fall −12%, recovery fixtures, updatedAt 1 Oct 2026
  lib/
    calculations.ts    pure: monthlyRate, projectValue, goalImpact, monthsToTarget, unitsDelta, buildFearCardNumbers(profile)
    rules.ts           cardFor(reason), show48h(profile, reason)
    explainer.ts       explain(numbers, reason) → string; guardrail (BANNED regex list); fallback template
    explainability.ts  NUMBER_SOURCES: number_id → {label, source, calculation, assumption, updated}
    analytics.ts       trackEvent(name, payload) → in-memory store + console.info + subscribe() for the event log
    format.ts          inr(), inrLakh(), months()
  content/copy.ts      ALL user-facing strings (so the guardrail test can scan them)
  state/flow.ts        reducer, Step type, actions, hash sync hook
  components/
    shell/        AppShell (desktop two-column), PhoneColumn, Sheet (bottom sheet / modal), Button
    landing/      Landing
    sip/          SipDetail, StopSheet
    reason-picker/ReasonPicker, V2Sheet
    context-card/ FearCard, GoalBars
    explainability/WhySheet
    decision/     DecisionScreen
    cash-flow/    CashCard, ReduceSheet, MoveDateSheet, EmergencyCheck
    confirmation/ Confirmation, CheckIn30
    demo/         ContextPanel (persona + pipeline), EventLog
  test/  calculations.test.ts, guardrail.test.ts
e2e/     flows.spec.ts
```

## 3. State model (`state/flow.ts`)

```ts
type Step = 'landing' | 'sip_detail' | 'reason' | 'fear' | 'cash' | 'v2' | 'decision' | 'confirmed' | 'checkin'
type Reason = 'market_falling' | 'need_cash' | 'just_pause' | 'fund_doubt'
type Choice = 'continue' | 'pause_1m' | 'remind_48h' | 'pause_anyway'
            | 'skip_1' | 'reduce' | 'move_date'
State = { user: 'riya'|'arjun', sipId, step, reason?, choice?, choiceDetail?,  // e.g. reduced amount, new date
          whyOpen: number_id | null, sheet: 'stop'|'v2'|'reduce'|'move_date'|'emergency'|null,
          sipStatus: 'active'|'paused'|'reminder_set'|'skipped'|'reduced'|'date_moved' }
```

`explanation_open` is `whyOpen !== null` (an overlay on top of `fear`, not a separate step).

Transitions:
- `landing → sip_detail`
- `sip_detail → reason`
- `reason → fear | cash | decision | v2-sheet`
- `fear → decision`, or `fear → confirmed` via Pause anyway
- `cash → confirmed`
- `decision → confirmed`
- `confirmed → sip_detail` (Done), or `confirmed → checkin`

## 4. Screens and exact copy

The phone column is `max-w-[420px]`, centred. Sticky action footers sit on mobile. Body text is at least 15px. Tap targets are at least 48px tall.

**Landing.** Eyebrow "SECOND LOOK". The line "Riya's portfolio is down 9%." Below it, "She is considering pausing her ₹5,000 monthly SIP." Mini facts: Pune · 27 · Software Tester · goal ₹6 lakh home by Mar 2031. Primary button "Try the Second Look". Secondary card (P2): "Arjun, 34 · needs ₹40,000 for a medical bill. Same button, different need."

**SIP detail.** Header "My SIPs". The card shows:
- Flexi-cap fund · ₹5,000 / month
- Since Mar 2024 · next instalment 10 Oct
- Invested ₹1.55 lakh · Value ₹1.41 lakh · **−9%** (orange chip)
- Goal progress bar 24% → ₹6 lakh home, Mar 2031

Buttons: **Pause** (primary blue, full width) and Stop (secondary outline). Stop opens StopSheet: "Stop isn't part of this prototype. Second Look's MVP covers Pause." with a Close button.

**Reason picker (sheet).** Title "What's making you pause?" Subline "One tap. You can still pause right after." Four chips, one tap each. Selecting a chip shows its selected state and advances after about 150ms; there is no separate Next button.
- **Market is falling**: prominent, blue-outlined, first.
- **Need cash**
- **Just pause**
- **Fund isn't performing** with a `V2` badge, greyed (still focusable). It opens V2Sheet: "Coming in V2. Future version: Compare 3y and 5y rolling returns vs category median, expense ratio, fund overlap and alternative SIP routing." with a "Back to reasons" button. This path must never imply the feature is shipped.

**Fear card ("Before you pause").** A chip at the top: "Based on your goal · ₹6 lakh home, Mar 2031".
- GOAL IMPACT:
  - "Pausing 6 months = ₹30,000 not invested."
  - "Your home goal: ₹47,000 less by Mar 2031, reached about 5 months later."
  - GoalBars: "Keep going 100%" (blue) vs "Pause 6 months 92%" (blue-tint). Caption "Projected value at Mar 2031, relative to keeping your SIP running."
- PRICE TODAY: "At today's prices, ₹5,000 buys 14% more units than in July."
- PAST FALLS: "Flexi-cap funds have experienced similar drawdowns before." Then "Median recovery: ~8 months" and "Slowest recovery: ~18 months". Small text: "Illustrative historical range; varies by drawdown and fund."
- Plain-language line from `explain()`: "Pausing could leave your home goal about ₹47,000 short and push it roughly 5 months later."
- Each number gets a small ⓘ that opens WhySheet focused on it. Below the sections, a full-width tertiary button "Why am I seeing this?".
- Sticky footer, two equal-width buttons: **See my options** (primary) and **Pause anyway** (outline, same size, same weight).

**WhySheet.** Title "Why am I seeing this?"
- Data: AMFI NAV history, investor portfolio, goal
- Assumptions: 11% annual return; SIP resumes after 6 months
- Historical recovery figures shown illustratively.
- Updated: 1 Oct 2026
- Line: "Numbers come from a fixed calculation, not from AI. The wording is generated from those numbers and checked for advice language."
- Expandable "How each number was calculated". Each number_id lists its inputs and formula, using engine values from section 1.
- Footer: "Your authorised portfolio data is used only for this decision."
- Pinned at the bottom: **"This is information, not investment advice."**
- Close button and Esc both return to the card. Fire `why_opened {number_id}`; the general button sends `number_id: 'all'`.

**Decision ("Your choice").** Status line: "SIP active · next instalment 10 Oct". Four equal-size stacked buttons, all the same visual weight (outlined), with a one-line consequence under each label:
- Continue: "Keeps your ₹5,000 SIP running"
- Pause 1 month: "Skips 10 Oct, resumes 10 Nov"
- Remind me in 48 hours: "Nothing changes now. We'll ask again on 7 Oct". Shown only when `show48h()` is true.
- Pause anyway: "Pauses for 6 months, resumes 10 Apr 2027"

Footer: "You can still pause at any time."

**Cash card ("Need cash?").** "Your SIP is one of several places you can create short-term cash flexibility." **Pause SIP** is the primary full-width button at the top (deck: "Pause is the primary button"). Below it, four option rows:
- Skip 1 instalment: confirms directly ("Skip 10 Oct; resumes 10 Nov").
- Reduce amount: sheet with chips ₹1,000 / ₹2,000 / ₹3,000, then confirm.
- Move SIP date: sheet with chips 15th / 20th / 25th / 28th, then confirm.
- Emergency-fund check: sheet with factual lines only. "Pausing stops future instalments; it doesn't release money already invested." and "While paused, ₹5,000 a month stays in your account." Close.

There are no extra questions on this path.

**Confirmation.** Animated ✓, then "Confirmed" and "Choice saved". The body depends on the choice:
- continue: "Your SIP stays active. Next instalment 10 Oct."
- pause_1m: "Paused for 1 month. Resumes 10 Nov."
- pause_anyway: "Your SIP pause has been recorded. Resumes 10 Apr 2027."
- remind_48h: "Reminder set for 7 Oct. Your SIP has not been paused."
- skip_1, reduce, and move_date each get an equivalent line.

Every confirmation then shows "Check-in on day 30 · We'll check in again after 30 days." Buttons: **Done** (back to SIP detail, which reflects the new `sipStatus` badge) and "Preview day-30 check-in".

**Check-in (day 30).** Title "30-day check-in". The copy follows the choice. For continue: "Last time, you chose to keep your SIP running during the market fall." plus the status "SIP still running". Buttons "Back to SIP" and "Start over". Opening it fires `decision_state_90d {still_standing: true}`, labelled in the event log as simulated.

**Desktop (≥1024px).** Two columns. Left (sticky, about 380px):
- Riya's context: SAYS "Everyone online says the market will crash further." and THINKS "If I pause now, I'll stop the bleeding." Market −12% chip, portfolio −9%.
- Pipeline: Data → Calculation engine → Reason classifier → AI explainer → Investor's screen. The active stage is highlighted for the current step.
- **Demo event log**, live, titled "Demo event log · this session only".

Right: the phone column at full height, no device frame. Below 1024px the left panel collapses into a "Demo info" button that opens a sheet.

## 5. Rules (`lib/rules.ts`)

- `cardFor`: market_falling → fear, need_cash → cash, just_pause → decision, fund_doubt → v2.
- `show48h`: true when `reason !== 'need_cash'` and (`profile.firstDrawdown` or `profile.lateRestarts > 0`). Riya has `firstDrawdown: true`. Do not add a cooling-off step to the cash path.

## 6. Analytics (`lib/analytics.ts`)

`trackEvent(name, payload)` attaches `ts` and `session_id`, pushes to the store, and logs with `console.info`.

| Event | Fired when | Payload |
|---|---|---|
| `pause_tapped` | Pause on SIP detail | `{sip_id:'riya-flexicap-5000', amount:5000}` |
| `reason_selected` | Reason chip tapped | `{reason}` |
| `card_viewed` | Leaving fear or cash | `{card_id:'fear_card'\|'cash_card', time_ms}` |
| `why_opened` | ⓘ or "Why am I seeing this?" | `{number_id}` |
| `decision_made` | Any final choice | `{choice, reason}` |
| `decision_state_90d` | Check-in opened | `{still_standing: true, simulated: true}` |

No dashboards and no aggregate metrics anywhere in the UI.

## 7. Guardrails (`lib/explainer.ts` + `guardrail.test.ts`)

The BANNED regex list (case-insensitive) covers:
- `you should`, `should continue`, `invest more`, `buy now`, `buying opportunity`, `don't sell`, `do not sell`
- `will recover`, `will go up`, `guaranteed`, `best choice`, `smartest`, `recommend`, `AI says`, `our algorithm`
- `mistake`, `are you sure`

The test scans every string exported from `content/copy.ts` and every `explain()` output for both reasons. Any match fails CI. At runtime, if an `explain()` output hits the list, the fallback template is used instead.

## 8. Visual tokens (from deck XML, already in `src/index.css`)

- Navy `#0A2A4A`: headings, dark bands.
- Text `#333333`.
- Blue `#0070C0`: primary.
- Pale blue surfaces `#EAF3FB` / `#BEE3F5`.
- Borders `#D9D9D9`; muted text `#8C8C8C`; surface `#F2F2F2`.
- Orange `#E67E22`: only for the −9% / −12% chips.
- Green `#2E8B57`: only for the confirmation check.
- Type: Inter via Google Fonts with tabular numerals. Large numerals for ₹ figures.
- Cards: 12px radius, 1px border, `shadow-sm` at most.
- A 4px blue top bar on each card header echoes the deck's horizontal bars.
- Motion: sheet slide-up about 200ms, card fade, check draw. Respect `prefers-reduced-motion`.

## 9. Deck edits the team must make (engine is truth)

| Slide | Current | Change to |
|---|---|---|
| 10 | "reached about 3 months later" | "reached about 5 months later" |
| 10 | Pause 6 months **95%** | **92%** |
| 11 | Goal + horizon "₹47,000 less, 3 months later" | "₹47,000 less, ~5 months later" |
| 11 | Engine "Pause 6 months: ₹47,000 less, ~3 months late" | "~5 months late" |

Also point the QR codes on slides 1, 10 and 15 at the Vercel production URL.

## 10. Build order

- **P0 (core story):** data + calculations + tests, then the flow reducer, then SIP detail, reason picker, fear card, WhySheet, decision screen and confirmation, then e2e for the Riya flow.
- **P1:** cash card and its sheets, V2 sheet, Stop sheet, check-in, Just pause path, desktop context panel and event log, guardrail test, hash/back-button sync, a11y pass.
- **P2:** Arjun entry (₹8,000 large-cap SIP; his fear card falls back to "value in 5 years" because he has no goal). Only start once everything above is green.

## 11. Definition of done

- `npm run build`, `npm run lint` and `npm test` are clean.
- `npm run e2e` passes:
  - the Riya flow to each of the 4 decision outcomes;
  - Pause anyway straight from the fear card (2 taps after Pause);
  - cash path: each of the 4 options plus Pause SIP;
  - Just pause path;
  - V2 sheet;
  - WhySheet open/close via the button, the ⓘ icons and Esc;
  - Back button;
  - zero `console.error` / `pageerror`;
  - screenshots at 375×812 and 1440×900 with no horizontal scroll.
- Grep finds no "lorem", "TODO" or "placeholder" in `src/`.
- Every ₹ figure on screen traces to `calculations.ts` or a labelled fixture.
- Run through the prompt's section 42 checklist manually.
