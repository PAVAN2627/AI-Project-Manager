export function getOptionalEnv(name, fallback) {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') return fallback
  return value
}

export function getRequiredEnv(name) {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getOptionalEnvNumber(name, fallback) {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for environment variable: ${name}`)
  }
  return parsed
}
