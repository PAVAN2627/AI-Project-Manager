import { useContext } from 'react'

import { AuthUserContext } from './authUserContext'

export function useAuthUser() {
  const state = useContext(AuthUserContext)
  if (!state) {
    throw new Error('useAuthUser must be used within <AuthUserProvider>.')
  }

  return state
}
