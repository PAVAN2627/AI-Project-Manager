export type IntentInterpretation = {
  showKanban: boolean
  filterStatus: 'All' | 'Blocked' | 'Done'
  showPrioritySelector: boolean
  showTeamAssignment: boolean
}

const FILTER_STATUSES: IntentInterpretation['filterStatus'][] = ['All', 'Blocked', 'Done']

function isIntentInterpretation(value: unknown): value is IntentInterpretation {
  if (!value || typeof value !== 'object') return false

  const maybe = value as {
    showKanban?: unknown
    filterStatus?: unknown
    showPrioritySelector?: unknown
    showTeamAssignment?: unknown
  }

  if (typeof maybe.showKanban !== 'boolean') return false
  if (typeof maybe.showPrioritySelector !== 'boolean') return false
  if (typeof maybe.showTeamAssignment !== 'boolean') return false
  if (typeof maybe.filterStatus !== 'string') return false
  if (!FILTER_STATUSES.includes(maybe.filterStatus as IntentInterpretation['filterStatus'])) return false

  return true
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybe = data as { error?: unknown; detail?: unknown }
    if (typeof maybe.error === 'string' && maybe.error.trim() !== '') {
      const detail = typeof maybe.detail === 'string' && maybe.detail.trim() !== '' ? `: ${maybe.detail}` : ''
      return `${maybe.error}${detail}`
    }
  }

  return fallback
}

export async function interpretIntent(input: string): Promise<IntentInterpretation> {
  const response = await fetch('/api/interpret-intent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })

  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status})`))
  }

  if (!isIntentInterpretation(data)) {
    throw new Error('Invalid intent response')
  }

  return data
}
