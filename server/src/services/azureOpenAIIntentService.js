import { createChatCompletion } from './azureOpenAIService.js'

const MAX_PROMPT_LENGTH = 4_000

function normalizePrompt(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > MAX_PROMPT_LENGTH ? trimmed.slice(0, MAX_PROMPT_LENGTH) : trimmed
}

function extractJsonObject(text) {
  if (typeof text !== 'string') return null

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
  const normalized = prompt.toLowerCase()
  const hasDone = /(\bdone\b|\bcompleted\b|\bfinished\b)/i.test(normalized)
  const hasBlocked = /(\bblocked\b|\bstuck\b|\bimpeded\b)/i.test(normalized)
  const hideKanban = /(\bhide\b|\bwithout\b|\bno\b).*(\bkanban\b|\bboard\b)/i.test(normalized)

  const showPrioritySelector = /(\bpriority\b|\bpriorities\b|\bprioritize\b)/i.test(normalized)
  const showTeamAssignment =
    /(\bassign\b|\bassignee\b|\bowner\b|\bteam\b|\bpeople\b)/i.test(normalized) &&
    !/(\bassign\s+priority\b|\bassign\s+priorities\b)/i.test(normalized)

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
