import type { TaskStatus } from '../types/task'

export type UIPlan = {
  kanban: {
    enabled: boolean
    filterStatus?: TaskStatus
  }
  prioritySelector: {
    enabled: boolean
  }
  teamAssignment: {
    enabled: boolean
  }
}

export type GenerativeUIAdapter = {
  /**
   * Given a user prompt, returns a "UI plan" describing which components should render.
   *
   * In a real Tambo integration, this would call the SDK/LLM and return structured output.
   */
  plan: (prompt: string) => Promise<UIPlan>
}
