import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { getHackathonUser } from './hackathonAuth'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'

function RequireHackathonUser({ children }: { children: ReactElement }) {
  const user = typeof window === 'undefined' ? null : getHackathonUser()
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RedirectIfAuthenticated({ children }: { children: ReactElement }) {
  const user = typeof window === 'undefined' ? null : getHackathonUser()
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          <RequireHackathonUser>
            <DashboardPage />
          </RequireHackathonUser>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
