import type { FirebaseOptions } from 'firebase/app'

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number]

function getEnvString(key: RequiredEnvKey, fallback: string): string {
  const value = (import.meta.env as Record<string, unknown>)[key]

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length > 0) return trimmed
  }

  return fallback
}

export const isFirebaseConfigured = REQUIRED_ENV_KEYS.every((key) => {
  const value = (import.meta.env as Record<string, unknown>)[key]
  return typeof value === 'string' && value.trim().length > 0
})

export const firebaseConfig: FirebaseOptions = {
  apiKey: getEnvString('VITE_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: getEnvString('VITE_FIREBASE_AUTH_DOMAIN', 'demo.firebaseapp.com'),
  projectId: getEnvString('VITE_FIREBASE_PROJECT_ID', 'demo-project'),
  storageBucket: getEnvString('VITE_FIREBASE_STORAGE_BUCKET', 'demo-project.appspot.com'),
  messagingSenderId: getEnvString('VITE_FIREBASE_MESSAGING_SENDER_ID', '000000000000'),
  appId: getEnvString('VITE_FIREBASE_APP_ID', '1:000000000000:web:0000000000000000'),
}
