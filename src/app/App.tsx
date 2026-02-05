import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { TamboProvider } from '@tambo-ai/react'

import { useAuthUser } from './useAuthUser'
import { DashboardPage } from '../pages/DashboardPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'

function AuthLoading() {
  return <div style={{ padding: 24 }}>Loading…</div>
}

function RequireSession({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuthUser()
  if (isLoading) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RedirectIfAuthenticated({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuthUser()
  if (isLoading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function App() {
  const tamboApiKey = import.meta.env.VITE_TAMBO_API_KEY

  return (
    <TamboProvider apiKey={tamboApiKey}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireSession>
              <DashboardPage />
            </RequireSession>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TamboProvider>
  )
}
