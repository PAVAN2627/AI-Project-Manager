import { Router } from 'express'

import { interpretIntentFromPrompt } from '../services/azureOpenAIIntentService.js'

export const interpretIntentRouter = Router()

const MAX_INPUT_LENGTH = 4_000

function normalizeInput(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > MAX_INPUT_LENGTH ? trimmed.slice(0, MAX_INPUT_LENGTH) : trimmed
}

interpretIntentRouter.post('/interpret-intent', async (req, res) => {
  const input = normalizeInput(req.body?.input ?? req.body?.prompt)
  if (!input) {
    res.status(400).json({
      error: "Missing 'input'",
      example: { input: 'Show me blocked tasks and assign priorities' },
    })
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
})
