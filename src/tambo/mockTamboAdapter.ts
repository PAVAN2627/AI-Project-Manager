import type { UIPlan } from './types'

function includesAny(haystack: string, needles: string[]) {
  const lowerHaystack = haystack.toLowerCase()
  return needles.some((n) => lowerHaystack.includes(n.toLowerCase()))
}

function matchesAny(haystack: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(haystack))
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

    const showPriority =
      hasPrompt &&
      includesAny(normalized, [
        'priority',
        'priorities',
        'prioritize',
        'reprioritize',
        'severity',
        'urgent',
        'critical',
      ])

    const statusFilter = (() => {
      if (!hasPrompt) return undefined
      if (includesAny(normalized, ['blocked', 'blocking', 'stuck'])) return 'blocked'
      if (includesAny(normalized, ['in progress', 'in-progress', 'in_progress', 'doing', 'wip'])) return 'in_progress'
      if (includesAny(normalized, ['todo', 'to do', 'to-do', 'backlog'])) return 'todo'
      if (includesAny(normalized, ['done', 'completed', 'finished'])) return 'done'
      return undefined
    })()

    const showTeamAssignment = (() => {
      if (!hasPrompt) return false

      const mentionsPeople = includesAny(normalized, [
        'assignee',
        'assignees',
        'team',
        'member',
        'members',
        'owner',
        'owners',
        'people',
        'person',
      ])

      const explicitlyAssigneeFocused = matchesAny(normalized, [
        /\bassigned\s+to\b/i,
        /\bassign\s+to\b/i,
        /\bassignee\b/i,
      ])

      const isAssigningPriorities = matchesAny(normalized, [
        /\bassign(?:ing|ed)?\s+(?:a\s+)?priorit(?:y|ies)\b/i,
        /\bset(?:ting)?\s+priorit(?:y|ies)\b/i,
      ])

      if (isAssigningPriorities) return explicitlyAssigneeFocused

      return explicitlyAssigneeFocused || (mentionsPeople && matchesAny(normalized, [/\bassign\b/i, /\breassign\b/i]))
    })()

    const showKanban =
      hasPrompt &&
      !includesAny(normalized, ['hide kanban', 'hide board', 'no kanban', 'no board', 'without kanban']) &&
      (showPriority ||
        showTeamAssignment ||
        Boolean(statusFilter) ||
        includesAny(normalized, ['task', 'tasks', 'kanban', 'board', 'show', 'display', 'list']))

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
