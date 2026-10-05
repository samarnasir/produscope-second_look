import { useSyncExternalStore } from 'react'
import { copy } from '../../content/copy'
import { getEvents, subscribe } from '../../lib/analytics'
import type { Flow, Step } from '../../state/flow'
import { Chip } from '../shell/ui'

/** Which pipeline stages are doing work on each screen. */
const ACTIVE: Record<Step, number[]> = {
  landing: [0],
  sip_detail: [0],
  reason: [2],
  fear: [1, 3],
  cash: [2],
  decision: [4],
  confirmed: [4],
  checkin: [4],
}

export function ContextPanel({ flow }: { flow: Flow }) {
  const { profile, state } = flow
  const events = useSyncExternalStore(subscribe, getEvents)
  const active = ACTIVE[state.step]
  const t = { head: 'text-paper', sub: 'text-mist', card: 'bg-white/[0.02] border-graphite', label: 'text-fog', idle: 'text-fog' }

  return (
    <div className="space-y-7">
      <div>
        <p className={`text-xs font-bold tracking-[0.14em] ${t.label}`}>PRODUSCOPE 2026 · FINLIT VENTURES</p>
        <h1 className={`mt-2 text-2xl font-bold leading-tight ${t.head}`}>Second Look</h1>
        <p className={`mt-1 text-sm ${t.sub}`}>Every irreversible money decision gets a 20-second second look, personalised to the investor's goal.</p>
      </div>

      <section aria-label={copy.panel.persona}>
        <h2 className={`text-[11px] font-bold tracking-[0.12em] ${t.label}`}>{copy.panel.persona.toUpperCase()}</h2>
        <div className={`mt-3 rounded-xl border p-4 ${t.card}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-semibold ${t.head}`}>
              {profile.name}, {profile.age}
            </span>
            <span className={`text-sm ${t.sub}`}>
              {profile.city} · {profile.occupation}
            </span>
          </div>
          {profile.id === 'riya' ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip>{copy.panel.marketFall}</Chip>
                <Chip>Portfolio −9%</Chip>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className={`text-[11px] font-bold tracking-[0.12em] ${t.label}`}>{copy.panel.says}</dt>
                  <dd className={t.sub}>“{profile.persona.says}”</dd>
                </div>
                <div>
                  <dt className={`text-[11px] font-bold tracking-[0.12em] ${t.label}`}>{copy.panel.thinks}</dt>
                  <dd className={t.sub}>“{profile.persona.thinks}”</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className={`mt-2 text-sm ${t.sub}`}>{profile.persona.does} Needs the fastest possible pause.</p>
          )}
        </div>
      </section>

      <section aria-label={copy.panel.pipeline}>
        <h2 className={`text-[11px] font-bold tracking-[0.12em] ${t.label}`}>{copy.panel.pipeline.toUpperCase()}</h2>
        <ol className="mt-3 space-y-1.5">
          {copy.panel.stages.map(([name, desc], i) => {
            const on = active.includes(i)
            return (
              <li
                key={name}
                aria-current={on ? 'step' : undefined}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${on ? 'border-mist bg-white/10' : t.card}`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${on ? 'bg-paper text-void' : 'bg-white/10 ' + t.idle}`}>
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${t.head}`}>{name}</span>
                  <span className={`block text-xs ${on ? 'text-mist' : t.idle}`}>{desc}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-label={copy.panel.log}>
        <h2 className={`text-[11px] font-bold tracking-[0.12em] ${t.label}`}>{copy.panel.log.toUpperCase()}</h2>
        <ul className={`mt-3 space-y-1.5 font-mono text-xs ${t.sub}`} data-testid="event-log">
          {events.length === 0 && <li className={t.idle}>{copy.panel.logEmpty}</li>}
          {events.slice(0, 8).map((e) => (
            <li key={e.id} className={`rounded-md border px-2.5 py-1.5 ${t.card}`}>
              <span className={`font-bold ${t.head}`}>{e.name}</span>{' '}
              <span className="break-words">{JSON.stringify(e.payload)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
