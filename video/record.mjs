// Records the demo video by driving the real app with Playwright.
// Cursor and captions are injected into the recorded page only; the app itself has no demo code.
// Usage: npm run build && node video/record.mjs
import { chromium } from '@playwright/test'
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 4175
const OUT = path.resolve('video')
const W = 1920
const H = 1080

const chromiumDir = fs.readdirSync('/opt/pw-browsers').find((d) => d.startsWith('chromium-'))
const exe = chromiumDir ? `/opt/pw-browsers/${chromiumDir}/chrome-linux/chrome` : undefined

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 2500))

const browser = await chromium.launch({ executablePath: exe && fs.existsSync(exe) ? exe : undefined })
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: path.join(OUT, 'raw'), size: { width: W, height: H } },
})
const page = await ctx.newPage()

await page.addInitScript(() => {
  const mount = () => {
    if (document.getElementById('__cur')) return
    const style = document.createElement('style')
    style.textContent = `
      #__cur{position:fixed;left:-50px;top:-50px;z-index:99999;pointer-events:none;transition:left .7s cubic-bezier(.4,0,.2,1),top .7s cubic-bezier(.4,0,.2,1)}
      #__rip{position:fixed;z-index:99998;pointer-events:none;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid #fff;opacity:0}
      #__rip.go{animation:__r .5s ease-out}
      @keyframes __r{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(3.2)}}
      #__cap{position:fixed;top:36px;left:50%;transform:translateX(-50%);z-index:99997;pointer-events:none;
        font:500 26px 'Inter Variable',Inter,system-ui,sans-serif;letter-spacing:-.011em;color:#fff;background:rgba(15,16,17,.92);
        border:1px solid #383b3f;border-radius:12px;padding:14px 26px;opacity:0;transition:opacity .35s;max-width:1100px;text-align:center}
      #__cap.on{opacity:1}`
    document.head.appendChild(style)
    const cur = document.createElement('div')
    cur.id = '__cur'
    cur.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2 4 7-3 1.5-4-7-5 4z" fill="#fff" stroke="#08090a" stroke-width="1.3" stroke-linejoin="round"/></svg>'
    const rip = document.createElement('div')
    rip.id = '__rip'
    const cap = document.createElement('div')
    cap.id = '__cap'
    document.body.append(cur, rip, cap)
  }
  document.addEventListener('DOMContentLoaded', mount)
})

const wait = (ms) => page.waitForTimeout(ms)
const caption = async (text) => {
  await page.evaluate((t) => {
    const c = document.getElementById('__cap')
    if (!t) return c.classList.remove('on')
    c.classList.remove('on')
    setTimeout(() => {
      c.textContent = t
      c.classList.add('on')
    }, 250)
  }, text)
}
async function click(locator, { settle = 700 } = {}) {
  await locator.scrollIntoViewIfNeeded()
  const b = await locator.boundingBox()
  const x = b.x + b.width / 2
  const y = b.y + b.height / 2
  await page.evaluate(([x, y]) => {
    const c = document.getElementById('__cur')
    c.style.left = x - 6 + 'px'
    c.style.top = y - 4 + 'px'
  }, [x, y])
  await wait(settle + 200)
  await page.evaluate(([x, y]) => {
    const r = document.getElementById('__rip')
    r.style.left = x + 'px'
    r.style.top = y + 'px'
    r.classList.remove('go')
    void r.offsetWidth
    r.classList.add('go')
  }, [x, y])
  await wait(150)
  await locator.click()
}
const scrollPhone = (top) =>
  page.evaluate((t) => document.querySelector('.no-scrollbar').scrollTo({ top: t, behavior: 'smooth' }), top)
const btn = (name, opts = {}) => page.getByRole('button', { name, ...opts })

await page.goto(`http://localhost:${PORT}/`)
await wait(1800)

await caption('Riya, 27, is watching her SIP lose 9%')
await wait(3000)
await caption('She taps Pause')
await click(btn('Pause', { exact: true }))
await wait(1400)

await caption("Second Look asks why. One tap, no typing")
await wait(2200)
await click(btn(/^Market is falling/))
await wait(1500)

await caption('Before she pauses: what it costs her goal, from her own numbers')
await wait(3800)
await caption("Today's price level and past falls, including the slow recoveries")
await scrollPhone(300)
await wait(3600)
await caption('Every figure has a source')
await click(btn('Why am I seeing this?', { exact: true }))
await wait(2800)
await page.evaluate(() => document.querySelector('[role=dialog] .overflow-y-auto')?.scrollTo({ top: 500, behavior: 'smooth' }))
await wait(3000)
await page.keyboard.press('Escape')
await wait(900)

await caption('Pause anyway is always one tap. The decision stays hers')
await scrollPhone(0)
await wait(800)
await click(btn('See my options'))
await wait(2600)
await caption('Four equal choices. Nothing pre-selected')
await wait(2200)
await click(btn(/^Continue/))
await wait(2000)
await caption('Choice saved. A check-in follows on day 30')
await wait(2800)
await click(btn('See day-30 check-in'))
await wait(3200)
await click(btn('Back to SIP'))
await wait(1500)

await caption('Same Pause button, different need: Arjun has a medical bill')
await click(page.getByRole('button', { name: 'Account' }))
await wait(1500)
await click(page.getByRole('radio', { name: /Arjun Mehta/ }))
await wait(2200)
await click(btn('Pause', { exact: true }))
await wait(1300)
await click(btn(/^Need cash/))
await wait(1500)
await caption('No lecture: Pause comes first, plus ways to free up cash')
await wait(3400)
await click(btn(/^Skip 1 instalment/))
await wait(2600)
await caption('Second Look: every pause, informed. The decision stays yours')
await wait(3800)
await caption(null)
await wait(600)

const video = page.video()
await ctx.close()
await browser.close()
server.kill()
const raw = await video.path()
const mp4 = path.join(OUT, 'second-look-demo.mp4')
execFileSync('ffmpeg', ['-y', '-i', raw, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'slow', '-movflags', '+faststart', '-an', mp4], { stdio: 'ignore' })
fs.rmSync(path.join(OUT, 'raw'), { recursive: true, force: true })
console.log('wrote', mp4)
