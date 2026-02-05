import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { onAuthStateChanged, type User } from 'firebase/auth'

import { auth } from '../firebase/firebase'
import { AuthUserContext, type AuthUserState } from './authUserContext'

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthUserState>(() => ({ user, isLoading }), [user, isLoading])

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}
