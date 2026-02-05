export const INTENT_FILTER_STATUSES = ['All', 'Blocked', 'Done'] as const

export type IntentFilterStatus = (typeof INTENT_FILTER_STATUSES)[number]

export type IntentInterpretation = {
  showKanban: boolean
  filterStatus: IntentFilterStatus
  showPrioritySelector: boolean
  showTeamAssignment: boolean
}

function parseIntentFilterStatus(value: unknown): IntentFilterStatus | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()

  if (normalized === '' || normalized === 'all') return 'All'
  if (normalized === 'blocked') return 'Blocked'
  if (normalized === 'done') return 'Done'

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

  const hasAnyKnownKey =
    'showKanban' in maybe ||
    'filterStatus' in maybe ||
    'showPrioritySelector' in maybe ||
    'showTeamAssignment' in maybe

  if (!hasAnyKnownKey) {
    return {
      showKanban: true,
      filterStatus: 'All',
      showPrioritySelector: false,
      showTeamAssignment: false,
    }
  }

  const showKanban = typeof maybe.showKanban === 'boolean' ? maybe.showKanban : true
  const showPrioritySelector =
    typeof maybe.showPrioritySelector === 'boolean' ? maybe.showPrioritySelector : false
  const showTeamAssignment = typeof maybe.showTeamAssignment === 'boolean' ? maybe.showTeamAssignment : false

  const rawFilterStatus = parseIntentFilterStatus(maybe.filterStatus)
  const filterStatus = rawFilterStatus ?? 'All'

  return {
    showKanban,
    filterStatus,
    showPrioritySelector,
    showTeamAssignment,
  }
}

function summarizeErrors(errors: unknown): string | null {
  if (!Array.isArray(errors) || errors.length === 0) return null

  const messages = errors
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim()
      if (entry && typeof entry === 'object') {
        const maybeEntry = entry as { message?: unknown }
        if (typeof maybeEntry.message === 'string') return maybeEntry.message.trim()
      }
      return ''
    })
    .filter((message): message is string => message !== '')

  if (messages.length === 0) return null

  const shown = messages.slice(0, 3)
  const suffix = messages.length > 3 ? '…' : ''
  return `${shown.join('; ')}${suffix}`
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybe = data as { error?: unknown; detail?: unknown; message?: unknown; errors?: unknown }

    const errorsSummary = summarizeErrors(maybe.errors)

    const primary =
      typeof maybe.error === 'string' && maybe.error.trim() !== ''
        ? maybe.error
        : typeof maybe.message === 'string' && maybe.message.trim() !== ''
          ? maybe.message
          : null

    if (primary) {
      const detail = typeof maybe.detail === 'string' && maybe.detail.trim() !== '' ? `: ${maybe.detail}` : ''
      return errorsSummary ? `${primary}${detail} (${errorsSummary})` : `${primary}${detail}`
    }

    if (errorsSummary) return errorsSummary
  }

  return fallback
}

export class IntentApiError extends Error {
  public readonly status?: number
  public readonly details?: unknown

  constructor(message: string, options?: { status?: number; details?: unknown }) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'IntentApiError'
    this.status = options?.status
    this.details = options?.details
  }
}

export async function interpretIntent(
  input: string,
  fetchFn: typeof fetch = fetch,
): Promise<IntentInterpretation> {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new IntentApiError('Input is required to interpret intent')
  }

  const response = await fetchFn('/api/interpret-intent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ input: trimmed }),
  })

  let data: unknown = null
  try {
    const raw = await response.text()
    if (raw) {
      try {
        data = JSON.parse(raw) as unknown
      } catch {
        data = raw
      }
    }
  } catch {
    data = null
  }
  if (!response.ok) {
    const message = getErrorMessage(data, `Request failed (${response.status})`)
    throw new IntentApiError(`${message} [HTTP ${response.status}]`, {
      status: response.status,
      details: data,
    })
  }

  const parsed = parseIntentInterpretation(data)
  if (!parsed) {
    throw new IntentApiError('Invalid intent response from /api/interpret-intent', {
      status: response.status,
      details: data,
    })
  }

  return parsed
}
