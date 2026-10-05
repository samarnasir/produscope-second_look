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
      <section className="border-b border-graphite px-5 pb-8 pt-9 text-paper">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fog">{copy.landing.eyebrow}</p>
        <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.022em]">
          {p.firstName}'s portfolio is down <span className="text-coral-red">9%</span>.
        </h1>
        <p className="mt-3 text-lg leading-snug text-mist">
          She is considering pausing her {inr(p.sip.amount)} monthly SIP.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Investor', `${p.age} · ${p.city}`],
            ['Works as', p.occupation],
            ['Goal', `${p.goal!.short}`],
            ['By', p.goal!.dateLabel],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-graphite bg-carbon px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-fog">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-5 py-6">
        <p className="text-[15px] leading-relaxed text-mist">{copy.landing.tagline}</p>
        <Card className="mt-5 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold text-paper">{copy.landing.arjunTitle}</h2>
          <p className="mt-1 text-sm text-mist">{copy.landing.arjunBody}</p>
          <button
            type="button"
            onClick={() => flow.actions.start('arjun')}
            className="mt-2 -ml-2 min-h-11 rounded-md px-2 text-sm font-semibold text-mist hover:bg-white/5"
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
