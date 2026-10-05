import type { ReactNode } from 'react'
import { ContextPanel } from '../demo/ContextPanel'
import type { Flow } from '../../state/flow'
import { copy } from '../../content/copy'

export function AppShell({ flow, children }: { flow: Flow; children: ReactNode }) {
  const { state } = flow
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[400px_1fr]">
      <aside className="hidden border-r border-graphite bg-carbon text-paper lg:block">
        <div className="sticky top-0 h-dvh overflow-y-auto p-7">
          <ContextPanel flow={flow} />
        </div>
      </aside>
      <div className="flex min-h-dvh justify-center bg-void lg:items-center lg:py-4">
        {/* Desktop: phone frame. The transform makes it the containing block for fixed-position sheets. */}
        <div
          className="relative w-full max-w-[460px] lg:h-[min(820px,calc(100dvh-2rem))] lg:w-[390px] lg:max-w-none lg:overflow-hidden lg:rounded-[46px] lg:border-[10px] lg:border-obsidian lg:shadow-xl lg:ring-1 lg:ring-smoke lg:[transform:translateZ(0)]"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-2 z-30 hidden h-5 w-24 -translate-x-1/2 rounded-full bg-void lg:block"
            aria-hidden="true"
          />
          <div className="flex min-h-dvh flex-col bg-void lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="hidden h-7 shrink-0 lg:block" aria-hidden="true" />
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-graphite px-5">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-paper text-xs font-bold text-void" aria-hidden="true">
                  2
                </span>
                <span className="text-[15px] font-bold tracking-tight text-paper">{copy.brand}</span>
              </div>
              <button
                type="button"
                onClick={() => flow.actions.openSheet('demo')}
                className="min-h-11 rounded-md px-2 text-sm font-medium text-mist hover:bg-white/5 lg:hidden"
              >
                {copy.panel.title}
              </button>
              {state.step !== 'landing' && (
                <button
                  type="button"
                  onClick={flow.actions.reset}
                  className="hidden min-h-11 rounded-md px-2 text-sm font-medium text-fog hover:bg-white/5 lg:block"
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
    <div className="sticky bottom-0 z-10 mt-auto border-t border-graphite bg-void/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      {children}
    </div>
  )
}
