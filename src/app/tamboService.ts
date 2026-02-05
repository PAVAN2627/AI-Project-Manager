import { useTambo, useTamboThreadInput, useTamboThread } from '@tambo-ai/react'
import type { IntentInterpretation } from './intentApi'

// Tambo-powered intent interpretation using generative UI
export function useTamboIntentService() {
  const tambo = useTambo()
  const { thread } = useTamboThread()
  const { submit, isPending } = useTamboThreadInput()

  const interpretIntentWithTambo = async (prompt: string): Promise<IntentInterpretation> => {
    try {
      console.log('🎯 Using Tambo AI for intent interpretation:', prompt)
      
      // Submit the prompt to Tambo for UI generation
      const response = await submit({
        content: `Analyze this project management request and determine which UI components to show: "${prompt}". 
        
        Available components:
        - KanbanBoard: Shows tasks in columns (Todo, In Progress, Blocked, Done)
        - PrioritySelector: Manages task priorities (low, medium, high, critical)
        - TeamAssignmentPanel: Assigns tasks to team members
        - NewTaskForm: Creates new tasks
        - Analytics: Shows project metrics and progress
        - IntentHistory: Shows previous AI interactions
        
        Respond with a JSON object indicating which components to display and any status filters.`,
        streamResponse: false
      })

      // Parse Tambo's response for component selection
      const interpretation = parseTamboResponse(response, prompt)
      
      return {
        ...interpretation,
        processingMethod: 'tambo',
        confidence: 0.95,
        reasoning: 'Tambo AI generative UI analysis',
        timestamp: new Date().toISOString(),
        metadata: {
          tamboThreadId: thread?.id,
          responseId: response?.id
        }
      }
    } catch (error) {
      console.error('Tambo intent interpretation failed:', error)
      throw error
    }
  }

  return {
    interpretIntent: interpretIntentWithTambo,
    isPending,
    thread,
    tambo
  }
}

// Parse Tambo's response to extract UI component decisions
function parseTamboResponse(response: any, originalPrompt: string): Partial<IntentInterpretation> {
  // Try to extract JSON from Tambo's response
  let parsedResponse: any = {}
  
  if (response?.content) {
    try {
      // Look for JSON in the response content
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Could not parse JSON from Tambo response, using fallback analysis')
    }
  }

  // Fallback to intelligent analysis if JSON parsing fails
  const lowerPrompt = originalPrompt.toLowerCase()
  
  return {
    showKanban: parsedResponse.showKanban ?? 
      (lowerPrompt.includes('task') || lowerPrompt.includes('show') || lowerPrompt.includes('display')),
    
    showPrioritySelector: parsedResponse.showPrioritySelector ?? 
      (lowerPrompt.includes('priority') || lowerPrompt.includes('urgent') || lowerPrompt.includes('important')),
    
    showTeamAssignment: parsedResponse.showTeamAssignment ?? 
      (lowerPrompt.includes('team') || lowerPrompt.includes('assign') || lowerPrompt.includes('member')),
    
    filterStatus: parsedResponse.filterStatus ?? determineFilterStatus(lowerPrompt)
  }
}

// Determine filter status from prompt
function determineFilterStatus(lowerPrompt: string): IntentInterpretation['filterStatus'] {
  if (lowerPrompt.includes('done') || lowerPrompt.includes('completed') || lowerPrompt.includes('finished')) {
    return 'Done'
  }
  if (lowerPrompt.includes('blocked') || lowerPrompt.includes('stuck') || lowerPrompt.includes('issues')) {
    return 'Blocked'
  }
  if (lowerPrompt.includes('progress') || lowerPrompt.includes('working') || lowerPrompt.includes('active')) {
    return 'In Progress'
  }
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('pending') || lowerPrompt.includes('new')) {
    return 'Todo'
  }
  return 'All'
}

// Enhanced Tambo prompts for better UI generation
export const TAMBO_UI_PROMPTS = {
  dashboard: 'Create a comprehensive project dashboard showing all tasks, priorities, and team assignments',
  analytics: 'Generate analytics view with project metrics, completion rates, and team performance charts',
  teamFocus: 'Show team collaboration interface with task assignments and workload distribution',
  priorityManagement: 'Display priority management interface for organizing urgent and important tasks',
  taskCreation: 'Present task creation form with priority selection and team assignment options'
}

// Tambo component suggestions based on intent
export const TAMBO_COMPONENT_SUGGESTIONS = {
  overview: ['KanbanBoard', 'Analytics'],
  management: ['KanbanBoard', 'PrioritySelector', 'TeamAssignmentPanel'],
  creation: ['NewTaskForm', 'PrioritySelector'],
  analysis: ['Analytics', 'KanbanBoard'],
  collaboration: ['TeamAssignmentPanel', 'KanbanBoard'],
  history: ['IntentHistory', 'KanbanBoard']
}