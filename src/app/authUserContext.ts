import { createContext } from 'react'

import type { User } from 'firebase/auth'

export type AuthUserState = {
  user: User | null
  isLoading: boolean
}

export const AuthUserContext = createContext<AuthUserState | null>(null)
