import { riya } from '../../data/riya'
import { copy } from '../../content/copy'
import { inr } from '../../lib/format'
import type { Flow } from '../../state/flow'
import { Footer } from '../shell/AppShell'
import { Button, Card } from '../shell/ui'

export function Landing({ flow }: { flow: Flow }) {
  const p = riya
  return (
    <>
      <section className="bg-navy px-5 pb-8 pt-9 text-white">
        <div className="mb-5 h-1 w-14 rounded-full bg-blue" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-tint">{copy.landing.eyebrow}</p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-tight">
          {p.firstName}'s portfolio is down <span className="text-[#f5b36b]">9%</span>.
        </h1>
        <p className="mt-3 text-lg leading-snug text-white/85">
          She is considering pausing her {inr(p.sip.amount)} monthly SIP.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Investor', `${p.age} · ${p.city}`],
            ['Works as', p.occupation],
            ['Goal', `${p.goal!.short}`],
            ['By', p.goal!.dateLabel],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/8 px-3 py-2 ring-1 ring-white/15">
              <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-blue-tint">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-5 py-6">
        <p className="text-[15px] leading-relaxed text-ink">{copy.landing.tagline}</p>
        <Card className="mt-5 bg-blue-pale/60 p-4">
          <h2 className="text-sm font-bold text-navy">{copy.landing.arjunTitle}</h2>
          <p className="mt-1 text-sm text-ink">{copy.landing.arjunBody}</p>
          <button
            type="button"
            onClick={() => flow.actions.start('arjun')}
            className="mt-2 -ml-2 min-h-11 rounded-lg px-2 text-sm font-semibold text-blue hover:bg-blue-pale"
          >
            {copy.landing.arjunCta} →
          </button>
        </Card>
      </section>

      <Footer>
        <Button className="w-full" onClick={() => flow.actions.start('riya')}>
          {copy.landing.cta}
        </Button>
      </Footer>
    </>
  )
}
