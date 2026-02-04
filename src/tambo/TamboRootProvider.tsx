import { TamboProvider, TamboStubProvider, type TamboThread } from '@tambo-ai/react'
import { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'

import { tamboComponents } from './tamboComponents'
import { TamboProviderErrorBoundary } from './TamboProviderErrorBoundary'

const STUB_THREAD: TamboThread = {
  id: 'stub-thread',
  projectId: 'stub-project',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  messages: [],
}

export function TamboRootProvider({ children }: PropsWithChildren) {
  const rawApiKey = (import.meta.env as Record<string, string | undefined>).VITE_TAMBO_API_KEY
  const apiKey = rawApiKey?.trim()
  const hasWarned = useRef(false)

  const stub = (
    <TamboStubProvider thread={STUB_THREAD} components={tamboComponents}>
      {children}
    </TamboStubProvider>
  )

  useEffect(() => {
    if (hasWarned.current) return

    if (rawApiKey && !apiKey) {
      hasWarned.current = true
      console.warn('[tambo] VITE_TAMBO_API_KEY is set but empty; using stub provider.')
      return
    }

    if (apiKey === 'your_key_here') {
      hasWarned.current = true
      console.warn('[tambo] VITE_TAMBO_API_KEY is still set to the example value; using stub provider.')
    }
  }, [apiKey, rawApiKey])

  if (apiKey && apiKey !== 'your_key_here') {
    return (
      <TamboProviderErrorBoundary fallback={stub}>
        <TamboProvider apiKey={apiKey} components={tamboComponents}>
          {children}
        </TamboProvider>
      </TamboProviderErrorBoundary>
    )
  }

  return stub
}
