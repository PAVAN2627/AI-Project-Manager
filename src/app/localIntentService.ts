import type { IntentInterpretation, IntentFilterStatus } from './intentApi'

// Keywords for different UI components
const KANBAN_KEYWORDS = ['kanban', 'board', 'tasks', 'all tasks', 'show tasks', 'task board', 'view tasks']
const PRIORITY_KEYWORDS = ['priority', 'priorities', 'urgent', 'important', 'high priority', 'low priority', 'critical']
const TEAM_KEYWORDS = ['team', 'assign', 'assignment', 'member', 'members', 'delegate', 'assignee']

// Status filter keywords
const STATUS_KEYWORDS = {
  'todo': ['todo', 'to do', 'pending', 'new', 'not started'],
  'in_progress': ['progress', 'working', 'active', 'current', 'ongoing', 'in progress'],
  'blocked': ['blocked', 'stuck', 'waiting', 'issues', 'problems'],
  'done': ['done', 'completed', 'finished', 'complete', 'closed']
}

function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase()
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
}

function detectFilterStatus(text: string): IntentFilterStatus {
  const lowerText = text.toLowerCase()
  
  for (const [status, keywords] of Object.entries(STATUS_KEYWORDS)) {
    if (containsKeywords(lowerText, keywords)) {
      switch (status) {
        case 'todo': return 'Todo'
        case 'in_progress': return 'In Progress'
        case 'blocked': return 'Blocked'
        case 'done': return 'Done'
      }
    }
  }
  
  return 'All'
}

export function interpretIntentLocally(prompt: string): IntentInterpretation {
  const lowerPrompt = prompt.toLowerCase()
  
  // Analyze the prompt for different components
  const showKanban = containsKeywords(lowerPrompt, KANBAN_KEYWORDS) || 
                    lowerPrompt.includes('show') || 
                    lowerPrompt.includes('display') ||
                    lowerPrompt.includes('view')
  
  const showPrioritySelector = containsKeywords(lowerPrompt, PRIORITY_KEYWORDS)
  const showTeamAssignment = containsKeywords(lowerPrompt, TEAM_KEYWORDS)
  const filterStatus = detectFilterStatus(lowerPrompt)
  
  // Default behavior: if no specific components mentioned, show kanban
  const finalShowKanban = showKanban || (!showPrioritySelector && !showTeamAssignment)
  
  return {
    showKanban: finalShowKanban,
    showPrioritySelector,
    showTeamAssignment,
    filterStatus
  }
}

// Example prompts and their expected outputs for testing
export const EXAMPLE_PROMPTS = [
  {
    prompt: "Show me all tasks",
    expected: { showKanban: true, showPrioritySelector: false, showTeamAssignment: false, filterStatus: 'All' as IntentFilterStatus }
  },
  {
    prompt: "Display blocked tasks with priorities",
    expected: { showKanban: true, showPrioritySelector: true, showTeamAssignment: false, filterStatus: 'Blocked' as IntentFilterStatus }
  },
  {
    prompt: "Show team assignments and priorities",
    expected: { showKanban: false, showPrioritySelector: true, showTeamAssignment: true, filterStatus: 'All' as IntentFilterStatus }
  },
  {
    prompt: "Analytics and completed work",
    expected: { showKanban: true, showPrioritySelector: false, showTeamAssignment: false, filterStatus: 'Done' as IntentFilterStatus }
  },
  {
    prompt: "Assign urgent tasks to team members",
    expected: { showKanban: false, showPrioritySelector: true, showTeamAssignment: true, filterStatus: 'All' as IntentFilterStatus }
  }
]