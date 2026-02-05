import { useTambo } from '@tambo-ai/react'
import { useCallback, useState } from 'react'
import type { UIPlan } from './types'

/**
 * Enhanced Tambo integration for AI-driven UI generation
 * This hook leverages Tambo's generative capabilities for dynamic interface creation
 */
export function useEnhancedTamboUI() {
  const tambo = useTambo()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUI, setGeneratedUI] = useState<React.ReactNode>(null)
  const [error, setError] = useState<string | null>(null)

  const generateInterface = useCallback(async (prompt: string, context?: any) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Check if Tambo SDK is available
      if (tambo && 'generateUI' in tambo) {
        console.log('🚀 Using Tambo SDK for UI generation:', prompt)
        
        // Use Tambo's actual generative UI capabilities
        const result = await (tambo as any).generateUI({
          prompt,
          context: {
            currentPlan: context?.activePlan,
            userPreferences: context?.userPreferences,
            existingTasks: context?.tasks,
            ...context
          },
          options: {
            framework: 'react',
            styling: 'css-modules',
            animations: true,
            responsive: true
          }
        })
        
        setGeneratedUI(result.component)
        return result
      } else if (tambo && 'ai' in tambo) {
        // Fallback to using Tambo's AI for plan generation
        console.log('🤖 Using Tambo AI for plan generation:', prompt)
        
        const aiResponse = await (tambo as any).ai.generateText({
          prompt: `
            You are an AI interface designer. Given this user request: "${prompt}"
            Generate a JSON plan for a project management interface with the following structure:
            {
              "kanban": { "enabled": boolean, "filterStatus": "todo" | "in_progress" | "blocked" | "done" | null },
              "prioritySelector": { "enabled": boolean },
              "teamAssignment": { "enabled": boolean },
              "showAnalytics": boolean,
              "customComponents": []
            }
            
            Consider the context: ${JSON.stringify(context, null, 2)}
            
            Return only valid JSON.
          `,
          temperature: 0.3,
          maxTokens: 500
        })
        
        try {
          const plan = JSON.parse(aiResponse.text)
          return { plan, type: 'plan' }
        } catch (parseError) {
          throw new Error('Failed to parse AI response as JSON')
        }
      } else {
        // Enhanced fallback UI generation
        return generateFallbackUI(prompt)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate UI'
      setError(errorMessage)
      console.error('Tambo UI generation error:', err)
      
      // Return fallback on error
      return generateFallbackUI(prompt)
    } finally {
      setIsGenerating(false)
    }
  }, [tambo])

  const generateComponent = useCallback(async (componentType: string, props: any) => {
    if (tambo && 'generateComponent' in tambo) {
      return (tambo as any).generateComponent({
        type: componentType,
        props,
        style: 'modern-glass',
        animations: true
      })
    }
    
    return null
  }, [tambo])

  const enhanceExistingComponent = useCallback(async (component: React.ReactElement, enhancement: string) => {
    if (tambo && 'enhanceComponent' in tambo) {
      return (tambo as any).enhanceComponent(component, {
        enhancement,
        preserveLogic: true,
        style: 'modern-glass'
      })
    }
    
    return component
  }, [tambo])

  return {
    generateInterface,
    generateComponent,
    enhanceExistingComponent,
    generatedUI,
    isGenerating,
    error,
    isTamboAvailable: !!tambo
  }
}

/**
 * Enhanced fallback UI generation with more sophisticated logic
 */
function generateFallbackUI(prompt: string): { plan: UIPlan; type: 'plan' } {
  const lowerPrompt = prompt.toLowerCase()
  
  // Enhanced pattern matching with weights
  const patterns = {
    kanban: /\b(kanban|board|tasks?|columns?|workflow)\b/g,
    priority: /\b(priority|priorities|urgent|important|high|low)\b/g,
    team: /\b(team|assign|member|user|people|collaboration)\b/g,
    blocked: /\b(blocked?|stuck|issues?)\b/g,
    analytics: /\b(analytics?|stats?|metrics?|reports?|insights?)\b/g,
    completed: /\b(completed?|done|finished)\b/g,
    filter: /\b(filter|show|display|view|only)\b/g
  }
  
  const scores = Object.entries(patterns).reduce((acc, [key, pattern]) => {
    const matches = lowerPrompt.match(pattern)
    acc[key] = matches ? matches.length : 0
    return acc
  }, {} as Record<string, number>)
  
  // Determine filter status
  let filterStatus: UIPlan['kanban']['filterStatus'] = undefined
  if (scores.blocked > 0) filterStatus = 'blocked'
  else if (scores.completed > 0) filterStatus = 'done'
  
  // Generate plan based on scores and context
  const plan: UIPlan = {
    kanban: {
      enabled: scores.kanban > 0 || (!scores.priority && !scores.team) || lowerPrompt.includes('show') || lowerPrompt.includes('all'),
      filterStatus
    },
    prioritySelector: {
      enabled: scores.priority > 0 || scores.blocked > 0
    },
    teamAssignment: {
      enabled: scores.team > 0
    }
  }
  
  console.log('🎯 Enhanced fallback UI plan generated:', { prompt, scores, plan })
  
  return { plan, type: 'plan' }
}