import { copy } from '../../content/copy'
import { arjun } from '../../data/arjun'
import { riya } from '../../data/riya'
import type { Flow } from '../../state/flow'
import type { Tour } from '../../state/tour'
import { Sheet } from './Sheet'

const USERS = [riya, arjun]

export function AccountSheet({ flow, tour }: { flow: Flow; tour: Tour }) {
  const { state, actions } = flow
  const a = copy.account
  return (
    <Sheet title={a.title} onClose={actions.closeSheet} labelId="account-title">
      <div role="radiogroup" aria-label={a.switch} className="space-y-2">
        {USERS.map((u) => {
          const on = state.user === u.id
          return (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => (on ? actions.closeSheet() : actions.start(u.id))}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${on ? 'border-mist bg-white/10' : 'border-graphite hover:bg-white/5'}`}
            >
              <img src={u.photo} alt="" className="size-10 shrink-0 rounded-full object-cover ring-1 ring-smoke" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-paper">{u.name}</span>
                <span className="block text-sm text-fog">
                  {u.city} · {u.sip.fund}
                </span>
              </span>
              {on && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-paper" aria-hidden="true">
                  <path d="m3 8.5 3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 divide-y divide-graphite rounded-xl border border-graphite">
        <button type="button" onClick={tour.toggle} aria-pressed={tour.on} className="flex min-h-12 w-full items-center justify-between px-3 text-left text-[15px] text-mist hover:bg-white/5">
          {a.tips}
          <span className="text-sm text-fog">{tour.on ? 'On' : 'Off'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            actions.reset()
          }}
          className="flex min-h-12 w-full items-center px-3 text-left text-[15px] text-mist hover:bg-white/5"
        >
          {a.reset}
        </button>
      </div>
    </Sheet>
  )
}
