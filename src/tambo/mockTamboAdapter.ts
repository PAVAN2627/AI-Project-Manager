import type { UIPlan } from './types'

const PRIORITY_KEYWORDS = [
  'priority',
  'priorities',
  'prioritize',
  'reprioritize',
  'urgent',
  'critical',
]

const KANBAN_KEYWORDS = ['task', 'tasks', 'kanban', 'board']

const KANBAN_NEGATIONS = ['hide kanban', 'hide board', 'no kanban', 'no board', 'without kanban']

const TEAM_KEYWORDS = ['assignee', 'assignees', 'team', 'team member', 'team members', 'owner', 'owners']

function includesAnyIgnoreCase(text: string, needles: string[]) {
  const normalized = text.toLowerCase()
  return needles.some((n) => normalized.includes(n.toLowerCase()))
}

function matchesAnyIgnoreCase(text: string, patterns: RegExp[]) {
  const normalized = text.toLowerCase()
  return patterns.some((p) => p.test(normalized))
}

// If `UIPlan['kanban']['filterStatus']` adds new values, `STATUS_RULES` must be updated.
type StatusFilter = Exclude<UIPlan['kanban']['filterStatus'], undefined>

// IMPORTANT: array order defines precedence. If multiple statuses are mentioned, the first match wins.
// Order (highest to lowest): blocked > in_progress > todo > done.
const STATUS_RULES: Array<{ status: StatusFilter; patterns: RegExp[] }> = [
  { status: 'blocked', patterns: [/\bblocked\b/, /\bblocking\b/, /\bstuck\b/] },
  {
    status: 'in_progress',
    patterns: [/\bin\s+progress\b/, /\bin-progress\b/, /\bin_progress\b/, /\bdoing\b/, /\bwip\b/],
  },
  { status: 'todo', patterns: [/\btodo\b/, /\bto\s+do\b/, /\bto-do\b/, /\bbacklog\b/] },
  { status: 'done', patterns: [/\bdone\b/, /\bcompleted\b/, /\bfinished\b/] },
]

function getStatusFilter(normalized: string): UIPlan['kanban']['filterStatus'] {
  for (const rule of STATUS_RULES) {
    if (matchesAnyIgnoreCase(normalized, rule.patterns)) return rule.status
  }

  return undefined
}

function shouldShowTeamAssignment(normalized: string) {
  // Show the team assignment UI when the prompt is about assignees / assigning work,
  // but avoid false positives for phrases like "assign priorities".
  const mentionsTeam = includesAnyIgnoreCase(normalized, TEAM_KEYWORDS)
  const explicitlyAssigneeFocused = matchesAnyIgnoreCase(normalized, [
    /\bassigned\s+to\b/,
    /\bassign\s+to\b/,
    /\bassignee\b/,
  ])

  const assignVerb = matchesAnyIgnoreCase(normalized, [/\bassign\b/, /\breassign\b/])

  const isAssigningPriorities = matchesAnyIgnoreCase(normalized, [
    /\bassign(?:ing|ed)?\s+(?:a\s+)?priorit(?:y|ies)\b/,
    /\bset(?:ting)?\s+priorit(?:y|ies)\b/,
  ])

  const isPeopleAssignment = explicitlyAssigneeFocused || (mentionsTeam && assignVerb)

  // Avoid enabling team assignment for prompts like "assign priorities".
  if (isAssigningPriorities && !explicitlyAssigneeFocused && !mentionsTeam) return false
  return isPeopleAssignment
}

function hasKanbanNegation(normalized: string) {
  // Treat "don't just show the kanban" as a request for additional UI, not a negation.
  const dontJustKanban = matchesAnyIgnoreCase(normalized, [
    /\b(?:don['’]?t|do\s+not)\s+just\b.*\b(?:kanban|board)\b/,
  ])

  if (dontJustKanban) return false

  return (
    includesAnyIgnoreCase(normalized, KANBAN_NEGATIONS) ||
    matchesAnyIgnoreCase(normalized, [
      /\b(?:without|hide)\b.*\b(?:kanban|board)\b/,
      /\b(?:not|don['’]?t|do\s+not)\b\s+(?:show|display|list)\b.*\b(?:kanban|board)\b/,
    ])
  )
}

function shouldShowKanban(
  normalized: string,
  signals: {
    showPriority: boolean
    showTeamAssignment: boolean
    statusFilter: UIPlan['kanban']['filterStatus']
  },
) {
  // Negations always win over any positive signal (keywords, priority, team, or status).
  if (hasKanbanNegation(normalized)) return false

  // Default behavior: if the prompt mentions tasks/statuses or requests prioritization/assignment,
  // we keep the board visible as the shared "context" for those actions.

  const showTasksPhrase = matchesAnyIgnoreCase(normalized, [/\b(show|display|list)\b.*\b(tasks?|kanban|board)\b/])
  const hasKanbanContext = showTasksPhrase || includesAnyIgnoreCase(normalized, KANBAN_KEYWORDS)

  return (
    signals.showPriority ||
    signals.showTeamAssignment ||
    Boolean(signals.statusFilter) ||
    hasKanbanContext
  )
}

/**
* A placeholder adapter that *simulates* a Tambo-style Generative UI planner.
*
* Swap this out once we wire the real Tambo SDK. Keeping this boundary early makes it
* easy to replace "heuristics" with "SDK call" without touching the UI components.
*/
export class MockTamboAdapter {
  async plan(prompt: string): Promise<UIPlan> {
    const normalized = prompt.toLowerCase().trim()
    const hasPrompt = normalized.length > 0

    const showPriority = hasPrompt && includesAnyIgnoreCase(normalized, PRIORITY_KEYWORDS)
    const statusFilter = hasPrompt ? getStatusFilter(normalized) : undefined
    const showTeamAssignment = hasPrompt ? shouldShowTeamAssignment(normalized) : false
    const showKanban =
      hasPrompt &&
      shouldShowKanban(normalized, {
        showPriority,
        showTeamAssignment,
        statusFilter,
      })

    return {
      kanban: {
        enabled: showKanban,
        filterStatus: statusFilter,
      },
      prioritySelector: {
        enabled: showPriority,
      },
      teamAssignment: {
        enabled: showTeamAssignment,
      },
    }
  }
}
