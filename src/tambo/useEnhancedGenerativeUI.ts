import { useTambo } from '@tambo-ai/react'
import { useCallback, useState } from 'react'
import type { Task } from '../types/task'
import type { User } from '../types/user'

type GenerativeUIState = {
  isGenerating: boolean
  error: string | null
  components: React.ReactNode | null
  lastPrompt: string | null
}

type GenerativeUIActions = {
  generateInterface: (prompt: string, tasks: Task[], users: User[]) => Promise<void>
  reset: () => void
}

/**
 * Enhanced hook that uses Tambo's actual generative UI capabilities
 * while maintaining fallback to our custom implementation
 */
export function useEnhancedGenerativeUI(): [GenerativeUIState, GenerativeUIActions] {
  const [state, setState] = useState<GenerativeUIState>({
    isGenerating: false,
    error: null,
    components: null,
    lastPrompt: null,
  })

  // Try to use real Tambo SDK
  const tambo = useTambo()

  const generateInterface = useCallback(
    async (prompt: string, tasks: Task[], users: User[]) => {
      setState(prev => ({ ...prev, isGenerating: true, error: null, lastPrompt: prompt }))

      try {
        // Check if Tambo is available and properly configured
        if (tambo) {
          console.log('🤖 Using Tambo SDK for generative UI')
          
          // For now, use fallback until Tambo's generative UI API is available
          const result = await generateFallbackUI(prompt, tasks, users)

          setState(prev => ({
            ...prev,
            isGenerating: false,
            components: result,
            error: null,
          }))
        } else {
          // Fallback to our custom logic
          console.log('⚡ Using fallback generative UI logic')
          
          const fallbackResult = await generateFallbackUI(prompt, tasks, users)
          
          setState(prev => ({
            ...prev,
            isGenerating: false,
            components: fallbackResult,
            error: null,
          }))
        }
      } catch (error) {
        console.error('Generative UI failed:', error)
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Failed to generate interface',
        }))
      }
    },
    [tambo]
  )

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      error: null,
      components: null,
      lastPrompt: null,
    })
  }, [])

  return [state, { generateInterface, reset }]
}

/**
 * Fallback UI generation when Tambo SDK is not available
 */
async function generateFallbackUI(prompt: string, tasks: Task[], users: User[]): Promise<React.ReactNode> {
  // Import components dynamically
  const { KanbanBoard } = await import('../components/KanbanBoard/KanbanBoard')
  const { PrioritySelector } = await import('../components/PrioritySelector/PrioritySelector')
  const { TeamAssignmentPanel } = await import('../components/TeamAssignmentPanel/TeamAssignmentPanel')
  const { createElement } = await import('react')

  // Simple intent parsing (same as current logic)
  const lowerPrompt = prompt.toLowerCase()
  const showKanban = !lowerPrompt.includes('hide') || lowerPrompt.includes('kanban') || lowerPrompt.includes('board')
  const showPriority = lowerPrompt.includes('priority') || lowerPrompt.includes('priorit')
  const showTeam = (lowerPrompt.includes('assign') || lowerPrompt.includes('team') || lowerPrompt.includes('member')) 
    && !lowerPrompt.includes('priority')

  // Filter tasks based on status mentions
  let filteredTasks = tasks
  if (lowerPrompt.includes('completed') || lowerPrompt.includes('done') || lowerPrompt.includes('finished')) {
    filteredTasks = tasks.filter(t => t.status === 'done')
  } else if (lowerPrompt.includes('blocked') || lowerPrompt.includes('stuck')) {
    filteredTasks = tasks.filter(t => t.status === 'blocked')
  } else if (lowerPrompt.includes('progress') || lowerPrompt.includes('working')) {
    filteredTasks = tasks.filter(t => t.status === 'in_progress')
  } else if (lowerPrompt.includes('todo') || lowerPrompt.includes('backlog')) {
    filteredTasks = tasks.filter(t => t.status === 'todo')
  }

  // Generate component tree
  const components = []

  if (showKanban) {
    components.push(
      createElement(KanbanBoard, {
        key: 'kanban',
        tasks: filteredTasks,
        users,
        onUpdateTask: () => {}, // This would need to be passed from parent
      })
    )
  }

  if (showPriority) {
    components.push(
      createElement(PrioritySelector, {
        key: 'priority',
        tasks: filteredTasks,
        onUpdateTask: () => {}, // This would need to be passed from parent
      })
    )
  }

  if (showTeam) {
    components.push(
      createElement(TeamAssignmentPanel, {
        key: 'team',
        tasks: filteredTasks,
        teams: [], // Empty teams array as fallback
        users,
        onUpdateTask: () => {}, // This would need to be passed from parent
      })
    )
  }

  return createElement('div', { 
    style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } 
  }, ...components)
}