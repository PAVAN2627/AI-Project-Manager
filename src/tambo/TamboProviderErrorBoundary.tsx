import type { PropsWithChildren, ReactNode } from 'react'
import { Component } from 'react'

type TamboProviderErrorBoundaryProps = PropsWithChildren<{
  fallback: ReactNode
}>

type TamboProviderErrorBoundaryState = {
  hasError: boolean
}

export class TamboProviderErrorBoundary extends Component<
  TamboProviderErrorBoundaryProps,
  TamboProviderErrorBoundaryState
> {
  state: TamboProviderErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): TamboProviderErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[tambo] Falling back to stub provider:', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
