import { useCallback, useMemo, useState } from 'react'

import { MockTamboAdapter } from './mockTamboAdapter'
import type { GenerativeUIAdapter, UIPlan } from './types'

const DEFAULT_PLAN: UIPlan = {
  kanban: { enabled: false },
  prioritySelector: { enabled: false },
  teamAssignment: { enabled: false },
}

/**
* Hook to keep the UI -> "Generative UI" boundary small and swappable.
*
* When we integrate the real Tambo SDK, we should only have to replace the adapter.
*/
export function useGenerativeUI(adapter?: GenerativeUIAdapter) {
  const [isPlanning, setIsPlanning] = useState(false)

  const resolvedAdapter = useMemo<GenerativeUIAdapter>(() => {
    return adapter ?? new MockTamboAdapter()
  }, [adapter])

  const plan = useCallback(
    async (prompt: string) => {
      setIsPlanning(true)
      try {
        return await resolvedAdapter.plan(prompt)
      } finally {
        setIsPlanning(false)
      }
    },
    [resolvedAdapter],
  )

  return {
    plan,
    isPlanning,
    defaultPlan: DEFAULT_PLAN,
  }
}
