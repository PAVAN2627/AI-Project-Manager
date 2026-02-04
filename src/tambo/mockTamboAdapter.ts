import type { UIPlan } from './types'

const PRIORITY_KEYWORDS = [
  'priority',
  'priorities',
  'prioritize',
  'reprioritize',
  'severity',
  'urgent',
  'critical',
]

const KANBAN_KEYWORDS = ['task', 'tasks', 'kanban', 'board', 'show', 'display', 'list']

const KANBAN_NEGATIONS = ['hide kanban', 'hide board', 'no kanban', 'no board', 'without kanban']

const TEAM_KEYWORDS = ['assignee', 'assignees', 'team', 'member', 'members', 'owner', 'owners', 'people', 'person']

function includesAny(haystack: string, needles: string[]) {
  const lowerHaystack = haystack.toLowerCase()
  return needles.some((n) => lowerHaystack.includes(n.toLowerCase()))
}

function matchesAny(haystack: string, patterns: RegExp[]) {
  const lowerHaystack = haystack.toLowerCase()
  return patterns.some((p) => p.test(lowerHaystack))
}

function getStatusFilter(normalized: string): UIPlan['kanban']['filterStatus'] {
  // Precedence: blocked > in_progress > todo > done.
  if (includesAny(normalized, ['blocked', 'blocking', 'stuck'])) return 'blocked'
  if (includesAny(normalized, ['in progress', 'in-progress', 'in_progress', 'doing', 'wip'])) return 'in_progress'
  if (includesAny(normalized, ['todo', 'to do', 'to-do', 'backlog'])) return 'todo'
  if (includesAny(normalized, ['done', 'completed', 'finished'])) return 'done'
  return undefined
}

function shouldShowTeamAssignment(normalized: string) {
  const mentionsTeam = includesAny(normalized, TEAM_KEYWORDS)
  const explicitlyAssigneeFocused = matchesAny(normalized, [/\bassigned\s+to\b/, /\bassign\s+to\b/, /\bassignee\b/])

  const isAssigningPriorities = matchesAny(normalized, [
    /\bassign(?:ing|ed)?\s+(?:a\s+)?priorit(?:y|ies)\b/,
    /\bset(?:ting)?\s+priorit(?:y|ies)\b/,
  ])

  if (isAssigningPriorities) return explicitlyAssigneeFocused

  const assignVerb = matchesAny(normalized, [/\bassign\b/, /\breassign\b/])
  return explicitlyAssigneeFocused || (mentionsTeam && assignVerb)
}

function shouldShowKanban(
  normalized: string,
  signals: {
    showPriority: boolean
    showTeamAssignment: boolean
    statusFilter: UIPlan['kanban']['filterStatus']
  },
) {
  if (includesAny(normalized, KANBAN_NEGATIONS)) return false

  return (
    signals.showPriority ||
    signals.showTeamAssignment ||
    Boolean(signals.statusFilter) ||
    includesAny(normalized, KANBAN_KEYWORDS)
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

    const showPriority = hasPrompt && includesAny(normalized, PRIORITY_KEYWORDS)
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
