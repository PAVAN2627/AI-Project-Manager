import { Router } from 'express'

import { createChatCompletion } from '../services/azureOpenAIService.js'

export const azureOpenAIRouter = Router()

const MAX_MESSAGES = 20
const MAX_CONTENT_LENGTH = 4_000

function isValidMessage(message) {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.role === 'string' &&
    message.role.trim() !== '' &&
    typeof message.content === 'string' &&
    message.content.trim() !== '' &&
    message.content.trim().length <= MAX_CONTENT_LENGTH
  )
}

function normalizeMessages(body) {
  if (Array.isArray(body?.messages)) {
    if (body.messages.length > MAX_MESSAGES) {
      return { ok: false, error: `Too many messages (max ${MAX_MESSAGES})` }
    }

    if (!body.messages.every(isValidMessage)) {
      return { ok: false, error: "Each message must have non-empty 'role' and 'content' strings" }
    }

    return { ok: true, messages: body.messages }
  }

  if (typeof body?.prompt === 'string' && body.prompt.trim() !== '') {
    const trimmedPrompt = body.prompt.trim()
    if (trimmedPrompt.length > MAX_CONTENT_LENGTH) {
      return { ok: false, error: `Prompt is too long (max ${MAX_CONTENT_LENGTH} characters)` }
    }

    return { ok: true, messages: [{ role: 'user', content: trimmedPrompt }] }
  }

  return { ok: false, error: "Missing 'prompt' or 'messages'" }
}

azureOpenAIRouter.post('/chat', async (req, res) => {
  const normalized = normalizeMessages(req.body)
  if (!normalized.ok) {
    res.status(400).json({
      error: normalized.error,
      example: {
        prompt: 'Say hello',
        messages: [{ role: 'user', content: 'Say hello' }],
      },
    })
    return
  }

  try {
    const data = await createChatCompletion({ messages: normalized.messages })
    res.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (process.env.NODE_ENV !== 'production') {
      res.status(502).json({ error: 'Azure OpenAI request failed', detail: message })
      return
    }

    res.status(502).json({ error: 'Azure OpenAI request failed' })
  }
})
