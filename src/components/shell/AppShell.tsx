import type { ReactNode } from 'react'
import { ContextPanel } from '../demo/ContextPanel'
import type { Flow } from '../../state/flow'
import { copy } from '../../content/copy'

export function AppShell({ flow, children }: { flow: Flow; children: ReactNode }) {
  const { state } = flow
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[400px_1fr]">
      <aside className="hidden bg-navy text-white lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto p-7">
          <ContextPanel flow={flow} dark />
        </div>
      </aside>
      <div className="flex min-h-dvh justify-center bg-[#f4f7fb] lg:items-center lg:py-4">
        {/* Desktop: phone frame. The transform makes it the containing block for fixed-position sheets. */}
        <div
          className="relative w-full max-w-[460px] lg:h-[min(820px,calc(100dvh-2rem))] lg:w-[390px] lg:max-w-none lg:overflow-hidden lg:rounded-[46px] lg:border-[10px] lg:border-navy lg:shadow-[0_30px_80px_-20px_rgba(10,42,74,0.45)] lg:[transform:translateZ(0)]"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-2 z-30 hidden h-5 w-24 -translate-x-1/2 rounded-full bg-navy lg:block"
            aria-hidden="true"
          />
          <div className="flex min-h-dvh flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="hidden h-7 shrink-0 lg:block" aria-hidden="true" />
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-blue text-xs font-bold text-white" aria-hidden="true">
                  2
                </span>
                <span className="text-[15px] font-bold tracking-tight text-navy">{copy.brand}</span>
              </div>
              <button
                type="button"
                onClick={() => flow.actions.openSheet('demo')}
                className="min-h-11 rounded-lg px-2 text-sm font-medium text-blue hover:bg-blue-pale lg:hidden"
              >
                {copy.panel.title}
              </button>
              {state.step !== 'landing' && (
                <button
                  type="button"
                  onClick={flow.actions.reset}
                  className="hidden min-h-11 rounded-lg px-2 text-sm font-medium text-muted hover:bg-surface lg:block"
                >
                  {copy.sip.reset}
                </button>
              )}
            </header>
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Sticky action area at the bottom of a screen. */
export function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto border-t border-line bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      {children}
    </div>
  )
}
