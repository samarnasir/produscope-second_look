import { expect, test, type Page } from '@playwright/test'

function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`)
  })
  return errors
}

const noHScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

async function toReasons(page: Page, who: 'riya' | 'arjun' = 'riya') {
  await page.goto('/?tips=off')
  if (who === 'arjun') {
    await page.getByRole('button', { name: 'Account' }).click()
    await page.getByRole('radio', { name: /Arjun Mehta/ }).click()
  }
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(page.getByRole('dialog', { name: "What's making you pause?" })).toBeVisible()
}

test.describe('Riya: market is falling', () => {
  test('opens on the SIP → reason → fear card with deck numbers', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/?tips=off')
    await expect(page.getByRole('heading', { name: 'My SIPs' })).toBeVisible()
    await noHScroll(page)
    await expect(page.getByText('Flexi-cap fund').first()).toBeVisible()
    await expect(page.getByText('₹5,000').first()).toBeVisible()
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    await page.getByRole('button', { name: /Market is falling/ }).click()

    await expect(page.getByRole('heading', { name: 'Before you pause' })).toBeVisible()
    await expect(page.getByText('Pausing 6 months = ₹30,000 not invested.')).toBeVisible()
    await expect(page.getByText(/₹47,000 less/)).toBeVisible()
    await expect(page.getByText(/reached about 5 months later/)).toBeVisible()
    await expect(page.getByText('Keep going')).toBeVisible()
    await expect(page.getByText('100%')).toBeVisible()
    await expect(page.getByText('92%')).toBeVisible()
    await expect(page.getByText("At today's prices, ₹5,000 buys 14% more units than in July.")).toBeVisible()
    await expect(page.getByText('Median recovery: ~8 months')).toBeVisible()
    await expect(page.getByText('Slowest recovery: ~18 months')).toBeVisible()
    await expect(page.getByText('Illustrative historical range; varies by drawdown and fund.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pause anyway' })).toBeVisible()
    await noHScroll(page)
    expect(errors).toEqual([])
  })

  test('explainability sheet: button, info icon, Esc, close', async ({ page }) => {
    const errors = watchErrors(page)
    await toReasons(page)
    await page.getByRole('button', { name: /Market is falling/ }).click()

    await page.getByRole('button', { name: 'Why am I seeing this?', exact: true }).click()
    const dlg = page.getByRole('dialog', { name: 'Why am I seeing this?' })
    await expect(dlg).toBeVisible()
    await expect(dlg.getByText('AMFI NAV history, investor portfolio, goal')).toBeVisible()
    await expect(dlg.getByText('11% annual return; SIP resumes after 6 months')).toBeVisible()
    await expect(dlg.getByText('Historical recovery figures shown illustratively.')).toBeVisible()
    await expect(dlg.getByText('1 Oct 2026').first()).toBeVisible()
    await expect(dlg.getByText('This is information, not investment advice.')).toBeVisible()
    await expect(dlg.getByTestId('plain-words')).toHaveText(
      'Pausing could leave your home goal about ₹47,000 short and push it roughly 5 months later.',
    )
    await dlg.getByRole('button', { name: 'Close', exact: true }).last().click()
    await expect(dlg).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Before you pause' })).toBeVisible()

    await page.getByRole('button', { name: /Why am I seeing this\? price today/i }).click()
    await expect(dlg).toBeVisible()
    await expect(dlg.locator('[data-focused]')).toContainText('14% more units than in July')
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    expect(errors).toEqual([])
  })

  for (const [label, headline, body] of [
    ['Continue', 'Your SIP stays active.', 'Next instalment 10 Oct.'],
    ['Pause 1 month', 'Paused for 1 month.', 'resumes 10 Nov'],
    ['Remind me in 48 hours', 'Reminder set for 7 Oct.', 'Your SIP has not been paused.'],
    ['Pause anyway', 'Your SIP pause has been recorded.', 'resumes 10 Apr 2027'],
  ] as const) {
    test(`decision → ${label}`, async ({ page }) => {
      const errors = watchErrors(page)
      await toReasons(page)
      await page.getByRole('button', { name: /Market is falling/ }).click()
      await page.getByRole('button', { name: 'See my options' }).click()
      await expect(page.getByRole('heading', { name: 'Your choice' })).toBeVisible()
      for (const l of ['Continue', 'Pause 1 month', 'Remind me in 48 hours', 'Pause anyway'])
        await expect(page.getByRole('button', { name: new RegExp(`^${l}`) })).toBeVisible()
      await page.getByRole('button', { name: new RegExp(`^${label}`) }).click()

      await expect(page.getByRole('heading', { name: 'Confirmed' })).toBeVisible()
      await expect(page.getByText('Choice saved')).toBeVisible()
      await expect(page.getByTestId('outcome-headline')).toHaveText(headline)
      await expect(page.getByTestId('outcome-body')).toContainText(body)
      await expect(page.getByText('Check-in on day 30')).toBeVisible()

      await page.getByRole('button', { name: 'See day-30 check-in' }).click()
      await expect(page.getByRole('heading', { name: '30-day check-in' })).toBeVisible()
      if (label === 'Continue') await expect(page.getByText('Last time, you chose to keep your SIP running during the market fall.')).toBeVisible()
      await page.getByRole('button', { name: 'Back to SIP' }).click()
      await expect(page.getByRole('heading', { name: 'My SIPs' })).toBeVisible()
      expect(errors).toEqual([])
    })
  }

  test('Pause anyway straight from the fear card (2 taps after Pause)', async ({ page }) => {
    await toReasons(page)
    await page.getByRole('button', { name: /Market is falling/ }).click()
    await page.getByRole('button', { name: 'Pause anyway' }).click()
    await expect(page.getByRole('heading', { name: 'Confirmed' })).toBeVisible()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByText(/Paused until 10 Apr 2027/).first()).toBeVisible()
    await page.getByRole('button', { name: 'Resume SIP' }).click()
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  })

  test('browser Back walks the flow', async ({ page }) => {
    await toReasons(page)
    await page.getByRole('button', { name: /Market is falling/ }).click()
    await expect(page.getByRole('heading', { name: 'Before you pause' })).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('dialog', { name: "What's making you pause?" })).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('heading', { name: 'My SIPs' })).toBeVisible()
  })
})

test.describe('other reasons', () => {
  test('Just pause skips to the decision screen', async ({ page }) => {
    await toReasons(page)
    await page.getByRole('button', { name: /Just pause/ }).click()
    await expect(page.getByRole('heading', { name: 'Your choice' })).toBeVisible()
    await expect(page.getByText('Before you pause')).toHaveCount(0)
    await page.getByRole('button', { name: /^Pause anyway/ }).click()
    await expect(page.getByRole('heading', { name: 'Confirmed' })).toBeVisible()
  })

  test("Fund isn't performing is a V2 placeholder", async ({ page }) => {
    const errors = watchErrors(page)
    await toReasons(page)
    const fund = page.getByRole('button', { name: /Fund isn't performing/ })
    await expect(fund).toContainText('V2')
    await fund.click()
    const dlg = page.getByRole('dialog', { name: 'Coming in V2' })
    await expect(dlg).toBeVisible()
    await expect(dlg).toContainText('rolling returns vs category median')
    await dlg.getByRole('button', { name: 'Back to reasons' }).click()
    await expect(page.getByRole('dialog', { name: "What's making you pause?" })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('Need cash: Pause SIP is primary and reachable', async ({ page }) => {
    const errors = watchErrors(page)
    await toReasons(page)
    await page.getByRole('button', { name: /Need cash/ }).click()
    await expect(page.getByRole('heading', { name: 'Need cash?' })).toBeVisible()
    await expect(page.getByText('Your SIP is one of several places you can create short-term cash flexibility.')).toBeVisible()
    await page.getByRole('button', { name: 'Pause SIP' }).click()
    await expect(page.getByRole('heading', { name: 'Confirmed' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('Need cash: skip, reduce, move date, emergency check', async ({ page }) => {
    const errors = watchErrors(page)
    const cash = async () => {
      await toReasons(page)
      await page.getByRole('button', { name: /Need cash/ }).click()
    }
    await cash()
    await page.getByRole('button', { name: /^Skip 1 instalment/ }).click()
    await expect(page.getByTestId('outcome-headline')).toHaveText('One instalment skipped.')

    await cash()
    await page.getByRole('button', { name: /^Reduce amount/ }).click()
    await page.getByRole('radio', { name: '₹1,000' }).click()
    await page.getByRole('button', { name: 'Confirm reduction' }).click()
    await expect(page.getByTestId('outcome-headline')).toHaveText('SIP reduced to ₹1,000 a month.')
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByText('₹1,000').first()).toBeVisible()

    await cash()
    await page.getByRole('button', { name: /^Move SIP date/ }).click()
    await page.getByRole('radio', { name: '20th' }).click()
    await page.getByRole('button', { name: 'Confirm new date' }).click()
    await expect(page.getByTestId('outcome-headline')).toHaveText('SIP date moved to the 20th.')

    await cash()
    await page.getByRole('button', { name: /^Emergency-fund check/ }).click()
    const dlg = page.getByRole('dialog', { name: 'Emergency-fund check' })
    await expect(dlg).toContainText("doesn't release money already invested")
    await page.keyboard.press('Escape')
    await expect(dlg).toBeHidden()
    await expect(page.getByRole('button', { name: 'Pause SIP' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('Stop opens an explanatory sheet', async ({ page }) => {
    await page.goto('/?tips=off')
    await page.getByRole('button', { name: 'Stop', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Stop is outside this prototype' })).toBeVisible()
    await page.getByRole('button', { name: 'Close', exact: true }).last().click()
    await expect(page.getByRole('heading', { name: 'My SIPs' })).toBeVisible()
  })
})

test.describe('Arjun', () => {
  test('cash path, no 48h reminder, fear card has no goal wording', async ({ page }) => {
    const errors = watchErrors(page)
    await toReasons(page, 'arjun')
    await page.getByRole('button', { name: /Need cash/ }).click()
    await expect(page.getByText('You need ₹40,000 for a medical bill.')).toBeVisible()
    await page.getByRole('button', { name: /^Reduce amount/ }).click()
    await expect(page.getByRole('radio', { name: '₹4,000' })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: /Just pause/ }).click()
    await expect(page.getByRole('button', { name: /^Remind me in 48 hours/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: /Market is falling/ }).click()
    await expect(page.getByText(/Your investments:/)).toBeVisible()
    await expect(page.getByText(/later\./)).toHaveCount(0)
    expect(errors).toEqual([])
  })
})

test('event log (?debug) records the deck events', async ({ page }) => {
  test.skip(page.viewportSize()!.width < 1024, 'event log panel is desktop-only')
  await page.goto('/?tips=off&debug=1')
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.getByRole('button', { name: /Market is falling/ }).click()
  await page.getByRole('button', { name: 'Why am I seeing this?', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Pause anyway' }).click()
  const log = page.getByTestId('event-log')
  for (const n of ['pause_tapped', 'reason_selected', 'why_opened', 'card_viewed', 'decision_made'])
    await expect(log).toContainText(n)
})

test('responsive layout screenshots', async ({ page }, info) => {
  const n = info.project.name
  const shot = async (name: string, fullPage = false) => {
    await page.waitForTimeout(900) // let sheet / bar animations settle
    await page.screenshot({ path: `test-results/${name}-${n}.png`, fullPage })
    await noHScroll(page)
  }
  await page.goto('/?tips=off')
  await shot('2-sip')
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await shot('3-reasons')
  await page.getByRole('button', { name: /Market is falling/ }).click()
  await shot('4-fear', true)
  await page.getByRole('button', { name: 'Why am I seeing this?', exact: true }).click()
  await shot('5-why')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'See my options' }).click()
  await shot('6-decision')
  await page.getByRole('button', { name: /^Remind me in 48 hours/ }).click()
  await shot('7-confirmed')
  await page.getByRole('button', { name: 'See day-30 check-in' }).click()
  await shot('8-checkin')
  await page.getByRole('button', { name: 'Start over' }).click()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await page.getByRole('button', { name: /Need cash/ }).click()
  await shot('9-cash', true)
})

test.describe('guided tips', () => {
  test('show up to two at a time, advance as dismissed, and reset on refresh', async ({ page }, info) => {
    const errors = watchErrors(page)
    const wide = info.project.name === 'desktop'
    await page.goto('/')
    const tips = page.getByTestId('coach-tip')
    await expect(tips.first()).toContainText('Tap Pause')
    await expect(tips).toHaveCount(wide ? 2 : 1)
    if (wide) await expect(tips.nth(1)).toContainText('Your SIP at a glance')
    await page.screenshot({ path: `test-results/tip-sip-${info.project.name}.png` })

    // dismiss everything on this screen, one batch at a time; never more than two visible
    for (let i = 0; i < 4; i++) {
      const n = await tips.count()
      expect(n).toBeLessThanOrEqual(2)
      if (!n) break
      await tips.first().getByRole('button', { name: 'Got it' }).click()
    }
    await expect(tips).toHaveCount(0)

    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    await expect(tips.first()).toContainText('Market is falling')
    await expect(tips).toHaveCount(wide ? 2 : 1)
    await page.getByRole('button', { name: /^Market is falling/ }).click()
    await expect(tips.first()).toContainText('What a pause changes')
    await expect(tips.count()).resolves.toBeLessThanOrEqual(2)
    await page.screenshot({ path: `test-results/tip-fear-${info.project.name}.png` })

    await tips.first().getByRole('button', { name: 'Skip tips' }).click()
    await expect(tips).toHaveCount(0)
    await page.getByRole('button', { name: 'Account' }).click()
    await page.getByRole('button', { name: /^Tips/ }).click()
    await page.keyboard.press('Escape')
    await page.reload()
    await expect(tips.first()).toContainText('Tap Pause')
    expect(errors).toEqual([])
  })

  test('phone has no visible scrollbar', async ({ page }) => {
    await page.goto('/?tips=off')
    const w = await page.evaluate(() => {
      const el = document.querySelector('.no-scrollbar') as HTMLElement
      return el.offsetWidth - el.clientWidth
    })
    expect(w).toBe(0)
  })
})
