import { createChatCompletion } from './azureOpenAIService.js'

export const MAX_PROMPT_LENGTH = 4_000

function normalizePrompt(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt is too long (max ${MAX_PROMPT_LENGTH} characters)`)
  }
  return trimmed
}

function extractJsonObject(text) {
  if (typeof text !== 'string') return null

  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // Fall through to a slightly more permissive heuristic.
    }
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  const candidate = text.slice(start, end + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

function normalizeFilterStatus(value) {
  if (typeof value !== 'string') return 'All'
  const normalized = value.trim().toLowerCase()

  if (!normalized) return 'All'
  if (normalized === 'all' || normalized === 'any' || normalized === 'everything') return 'All'

  if (
    normalized === 'done' ||
    normalized === 'completed' ||
    normalized === 'complete' ||
    normalized === 'finished' ||
    normalized === 'finish'
  ) {
    return 'Done'
  }

  if (normalized === 'blocked' || normalized === 'stuck' || normalized === 'impeded') {
    return 'Blocked'
  }

  return 'All'
}

function normalizeBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function fallbackInterpret(prompt) {
  const hasDone = /(\bdone\b|\bcompleted\b|\bfinished\b)/i.test(prompt)
  const hasBlocked = /(\bblocked\b|\bstuck\b|\bimpeded\b)/i.test(prompt)
  const hideKanban = /(\bhide\b|\bwithout\b|\bno\b).*(\bkanban\b|\bboard\b)/i.test(prompt)

  const showPrioritySelector = /(\bpriority\b|\bpriorities\b|\bprioritize\b)/i.test(prompt)
  const showTeamAssignment =
    /(\bassign\b|\bassignee\b|\bowner\b|\bteam\b|\bpeople\b)/i.test(prompt) &&
    !/(\bassign\s+priority\b|\bassign\s+priorities\b)/i.test(prompt)

  return {
    showKanban: !hideKanban,
    filterStatus: hasDone ? 'Done' : hasBlocked ? 'Blocked' : 'All',
    showPrioritySelector,
    showTeamAssignment,
  }
}

function normalizeIntent(raw, prompt) {
  const fallback = fallbackInterpret(prompt)
  if (!raw || typeof raw !== 'object') return fallback

  return {
    showKanban: normalizeBoolean(raw.showKanban, fallback.showKanban),
    filterStatus: normalizeFilterStatus(raw.filterStatus),
    showPrioritySelector: normalizeBoolean(raw.showPrioritySelector, fallback.showPrioritySelector),
    showTeamAssignment: normalizeBoolean(raw.showTeamAssignment, fallback.showTeamAssignment),
  }
}

export async function interpretIntentFromPrompt({ prompt }) {
  const normalizedPrompt = normalizePrompt(prompt)
  if (!normalizedPrompt) {
    throw new Error("Missing 'prompt'")
  }

  const messages = [
    {
      role: 'system',
      content: [
        'You are an intent parser for a task dashboard UI.',
        'Return ONLY a JSON object (no markdown, no code fences) with this exact shape:',
        '{ "showKanban": boolean, "filterStatus": "Done"|"Blocked"|"All", "showPrioritySelector": boolean, "showTeamAssignment": boolean }',
        'Rules:',
        '- filterStatus must be exactly one of: Done, Blocked, All.',
        '- Treat done/completed/finished as Done.',
        '- Treat blocked/stuck/impeded as Blocked.',
        '- If the user asks to hide or not show the kanban/board, set showKanban=false.',
        '- If unclear, prefer: showKanban=true, filterStatus=All, showPrioritySelector=false, showTeamAssignment=false.',
      ].join('\n'),
    },
    { role: 'user', content: normalizedPrompt },
  ]

  const data = await createChatCompletion({ messages, temperature: 0 })

  const content = data?.choices?.[0]?.message?.content
  const parsed = extractJsonObject(content)

  return normalizeIntent(parsed, normalizedPrompt)
}
