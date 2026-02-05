import { Router } from 'express'

export const interpretIntentRouter = Router()

const MAX_PROMPT_LENGTH = 4000

function normalizeInput(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}

// Local rule-based interpretation
function interpretIntentLocally(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  
  const hasDone = /(\bdone\b|\bcompleted\b|\bfinished\b)/i.test(prompt)
  const hasBlocked = /(\bblocked\b|\bstuck\b|\bimpeded\b)/i.test(prompt)
  const hasInProgress = /(\bin\s+progress\b|\bin-progress\b|\binprogress\b|\bwip\b|\bworking\s+on\b)/i.test(prompt)
  const hasTodo = /(\btodo\b|\bto\s+do\b|\bbacklog\b)/i.test(prompt)
  
  const showKanban = /(\bkanban\b|\bboard\b|\btasks\b|\bshow\b|\bdisplay\b|\bdashboard\b|\bproject\b)/i.test(prompt)
  const showPrioritySelector = /(\bpriority\b|\bpriorities\b|\bprioritize\b|\burgent\b|\bimportant\b|\banalytics\b|\bperformance\b)/i.test(prompt)
  const showTeamAssignment = /(\bassign\b|\bteam\b|\bmember\b|\bdelegate\b|\banalytics\b|\bperformance\b|\bcollaboration\b)/i.test(prompt)
  
  let filterStatus = 'All'
  if (hasDone) filterStatus = 'Done'
  else if (hasBlocked) filterStatus = 'Blocked'
  else if (hasInProgress) filterStatus = 'In Progress'
  else if (hasTodo) filterStatus = 'Todo'
  
  // For comprehensive dashboard requests, enable multiple components
  const isComprehensiveRequest = /(\bcomprehensive\b|\bcomplete\b|\banalytics\b|\bperformance\b|\bdashboard\b)/i.test(prompt)
  
  return {
    showKanban: showKanban || isComprehensiveRequest,
    filterStatus,
    showPrioritySelector: showPrioritySelector || isComprehensiveRequest,
    showTeamAssignment: showTeamAssignment || isComprehensiveRequest,
    processingMethod: 'local'
  }
}

// Simple handler for local processing only
async function handleInterpretIntent(req, res) {
  const rawInput = req.body?.input ?? req.body?.prompt
  const input = normalizeInput(rawInput)
  
  if (!input) {
    res.status(400).json({
      error: "Missing 'input'",
      example: { 
        input: 'Show me blocked tasks and assign priorities'
      },
    })
    return
  }

  if (input.length > MAX_PROMPT_LENGTH) {
    res.status(413).json({ error: `Input too long (max ${MAX_PROMPT_LENGTH} characters)` })
    return
  }

  try {
    // Always use local processing for now
    const intent = interpretIntentLocally(input)
    
    // Add metadata
    intent.timestamp = new Date().toISOString()
    intent.inputLength = input.length
    
    res.json(intent)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    res.status(500).json({
      error: 'Processing failed',
      message,
      timestamp: new Date().toISOString()
    })
  }
}

// Options endpoint
async function handleGetOptions(req, res) {
  res.json({
    processingTypes: [
      {
        type: 'local',
        name: 'Local Processing',
        description: 'Fast rule-based processing without external API calls',
        speed: 'fastest',
        accuracy: 'good',
        features: ['Offline capability', 'Instant response', 'Reliable'],
        status: 'available'
      }
    ],
    defaultType: 'local',
    recommendedType: 'local',
    tamboNote: 'Tambo AI is integrated via React SDK in the frontend for generative UI',
    examples: [
      {
        input: 'Show me urgent tasks that need team assignment',
        expectedBehavior: {
          local: 'Matches keywords for priority and team features'
        }
      },
      {
        input: 'Display analytics dashboard with completed work',
        expectedBehavior: {
          local: 'Basic keyword matching for analytics and done status'
        }
      }
    ]
  })
}

interpretIntentRouter.post('/interpret-intent', handleInterpretIntent)
interpretIntentRouter.post('/api/interpret-intent', handleInterpretIntent)
interpretIntentRouter.get('/api/interpret-intent/options', handleGetOptions)
