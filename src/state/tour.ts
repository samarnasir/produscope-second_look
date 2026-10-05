import { useCallback, useState } from 'react'
import type { State } from './flow'

/** Tips live in memory only: every page load or refresh starts the tour again. */
export function useTour() {
  const [on, setOn] = useState(() => new URLSearchParams(window.location.search).get('tips') !== 'off')
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set())

  const dismiss = useCallback((key: string) => setSeen((s) => new Set(s).add(key)), [])
  const skip = useCallback(() => setOn(false), [])
  const toggle = useCallback(() => {
    setOn((v) => {
      if (!v) setSeen(new Set())
      return !v
    })
  }, [])
  return { on, seen, dismiss, skip, toggle }
}
export type Tour = ReturnType<typeof useTour>

/** Which tip group belongs to what is on screen right now. */
export function tourKey(s: State): string | null {
  if (s.whyOpen) return 'why'
  if (s.sheet) return null
  return s.step
}
