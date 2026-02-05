import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig'

let hasWarnedAboutConfig = false

function warnIfUsingDemoConfig() {
  if (isFirebaseConfigured) return
  if (hasWarnedAboutConfig) return
  hasWarnedAboutConfig = true

  const log = import.meta.env.DEV ? console.warn : console.error

  log(
    '[firebase] Missing VITE_FIREBASE_* env vars. Using demo Firebase config; set real values in `.env.local` (dev) or your deployment env.'
  )
}

export const firebaseApp: FirebaseApp = getApps().length
  ? getApps()[0]!
  : initializeApp(firebaseConfig)

warnIfUsingDemoConfig()

export const auth: Auth = getAuth(firebaseApp)
export const firestore: Firestore = getFirestore(firebaseApp)

export const db = firestore
