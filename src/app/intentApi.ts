export type IntentFilterStatus = 'All' | 'Blocked' | 'Done'

export type IntentInterpretation = {
  showKanban: boolean
  filterStatus: IntentFilterStatus
  showPrioritySelector: boolean
  showTeamAssignment: boolean
}

function parseIntentFilterStatus(value: unknown): IntentFilterStatus | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === 'All' || trimmed === 'Blocked' || trimmed === 'Done') return trimmed
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

  const filterStatus = parseIntentFilterStatus(maybe.filterStatus)
  if (!filterStatus) return null
  if (typeof maybe.showKanban !== 'boolean') return null
  if (typeof maybe.showPrioritySelector !== 'boolean') return null
  if (typeof maybe.showTeamAssignment !== 'boolean') return null

  return {
    showKanban: maybe.showKanban,
    filterStatus,
    showPrioritySelector: maybe.showPrioritySelector,
    showTeamAssignment: maybe.showTeamAssignment,
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybe = data as { error?: unknown; errors?: unknown }

    if (typeof maybe.error === 'string' && maybe.error.trim() !== '') {
      return maybe.error
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
        return messages.join('; ')
      }
    }
  }

  return fallback
}

export async function interpretIntent(input: string): Promise<IntentInterpretation> {
  const response = await fetch('/api/interpret-intent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input }),
  })

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
