import { Router } from 'express'

import { interpretIntentFromPrompt, MAX_PROMPT_LENGTH } from '../services/azureOpenAIIntentService.js'

export const interpretIntentRouter = Router()

function normalizeInput(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}

async function handleInterpretIntent(req, res) {
  const rawInput = req.body?.input ?? req.body?.prompt
  const input = normalizeInput(rawInput)
  if (!input) {
    res.status(400).json({
      error: "Missing 'input'",
      example: { input: 'Show me blocked tasks and assign priorities' },
    })
    return
  }

  if (input.length > MAX_PROMPT_LENGTH) {
    res.status(413).json({ error: `Input too long (max ${MAX_PROMPT_LENGTH} characters)` })
    return
  }

  try {
    const intent = await interpretIntentFromPrompt({ prompt: input })
    res.json(intent)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (process.env.NODE_ENV !== 'production') {
      res.status(502).json({ error: 'Azure OpenAI request failed', detail: message })
      return
    }

    res.status(502).json({ error: 'Azure OpenAI request failed' })
  }
}

interpretIntentRouter.post('/interpret-intent', handleInterpretIntent)
interpretIntentRouter.post('/api/interpret-intent', handleInterpretIntent)
