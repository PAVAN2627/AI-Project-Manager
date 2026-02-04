import type { UIPlan } from './types'

function includesAny(haystack: string, needles: string[]) {
  const lowerHaystack = haystack.toLowerCase()
  return needles.some((n) => lowerHaystack.includes(n.toLowerCase()))
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

    const showKanban = hasPrompt && includesAny(normalized, ['task', 'tasks', 'kanban', 'board', 'show'])
    const showPriority = hasPrompt && includesAny(normalized, ['priority', 'priorities', 'prioritize'])
    const showAssignments =
      hasPrompt && includesAny(normalized, ['assign', 'assignee', 'team', 'member', 'owner'])

    const filterBlocked = includesAny(normalized, ['blocked', 'blocking'])

    return {
      kanban: {
        enabled: showKanban,
        filterStatus: filterBlocked ? 'blocked' : undefined,
      },
      prioritySelector: {
        enabled: showPriority,
      },
      teamAssignment: {
        enabled: showAssignments,
      },
    }
  }
}
