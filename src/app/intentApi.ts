import { interpretIntentLocally } from './localIntentService'

export const INTENT_FILTER_STATUSES = ['All', 'Todo', 'In Progress', 'Blocked', 'Done'] as const

export type IntentFilterStatus = (typeof INTENT_FILTER_STATUSES)[number]

export type IntentInterpretation = {
  showKanban: boolean
  filterStatus: IntentFilterStatus
  showPrioritySelector: boolean
  showTeamAssignment: boolean
  processingMethod?: string
  confidence?: number
  reasoning?: string
  timestamp?: string
  metadata?: any
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

export type ProcessingType = 'local'

export async function interpretIntent(input: string): Promise<IntentInterpretation> {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new IntentApiError('Input is required to interpret intent')
  }

  // Use local interpretation for now
  console.log('🔍 Interpreting intent locally:', trimmed)
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = interpretIntentLocally(trimmed)
  return {
    ...result,
    processingMethod: 'local',
    timestamp: new Date().toISOString()
  }
}

// Get available processing options
export async function getProcessingOptions() {
  try {
    const response = await fetch('/api/interpret-intent/options')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch processing options:', error)
    return {
      processingTypes: [
        { type: 'local', name: 'Local Processing', status: 'available' }
      ],
      defaultType: 'local'
    }
  }
}
