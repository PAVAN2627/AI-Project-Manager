export type IntentFilterStatus = 'All' | 'Blocked' | 'Done'

export type IntentInterpretation = {
  showKanban: boolean
  filterStatus: IntentFilterStatus
  showPrioritySelector: boolean
  showTeamAssignment: boolean
}

export const DEFAULT_INTENT: Readonly<IntentInterpretation> = Object.freeze({
  showKanban: true,
  filterStatus: 'All',
  showPrioritySelector: false,
  showTeamAssignment: false,
})

function parseIntentFilterStatus(value: unknown): IntentFilterStatus | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'all') return 'All'

  if (normalized === 'blocked' || normalized === 'stuck' || normalized === 'impeded') {
    return 'Blocked'
  }

  if (normalized === 'done' || normalized === 'completed' || normalized === 'finished') {
    return 'Done'
  }

  return null
}

function parseIntentInterpretation(value: unknown): IntentInterpretation | null {
  if (!value || typeof value !== 'object') return null
  const maybe = value as {
    showKanban?: unknown
    filterStatus?: unknown
    showPrioritySelector?: unknown
    showTeamAssignment?: unknown
  }

  const filterStatus = parseIntentFilterStatus(maybe.filterStatus) ?? DEFAULT_INTENT.filterStatus

  return {
    showKanban: typeof maybe.showKanban === 'boolean' ? maybe.showKanban : DEFAULT_INTENT.showKanban,
    filterStatus,
    showPrioritySelector:
      typeof maybe.showPrioritySelector === 'boolean' ? maybe.showPrioritySelector : DEFAULT_INTENT.showPrioritySelector,
    showTeamAssignment:
      typeof maybe.showTeamAssignment === 'boolean' ? maybe.showTeamAssignment : DEFAULT_INTENT.showTeamAssignment,
  }
}

function sanitizeErrorMessage(message: string) {
  const singleLine = message.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= 200) return singleLine
  return `${singleLine.slice(0, 199)}…`
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybe = data as { error?: unknown; errors?: unknown }

    if (typeof maybe.error === 'string' && maybe.error.trim() !== '') {
      return sanitizeErrorMessage(maybe.error)
    }

    if (Array.isArray(maybe.errors)) {
      const messages = maybe.errors
        .map((entry) => {
          if (typeof entry === 'string') return entry
          if (entry && typeof entry === 'object') {
            const maybeEntry = entry as { message?: unknown }
            if (typeof maybeEntry.message === 'string') return maybeEntry.message
          }
          return null
        })
        .filter((message): message is string => typeof message === 'string' && message.trim() !== '')
        .slice(0, 3)

      if (messages.length > 0) {
        return sanitizeErrorMessage(messages.join('; '))
      }
    }
  }

  return fallback
}

export async function interpretIntent(input: string): Promise<IntentInterpretation> {
  let response: Response
  try {
    response = await fetch('/api/interpret-intent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input }),
    })
  } catch {
    throw new Error('Network error while contacting /api/interpret-intent')
  }

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  const intent = parseIntentInterpretation(data)
  if (!intent) {
    throw new Error('Invalid intent response')
  }

  return intent
}
