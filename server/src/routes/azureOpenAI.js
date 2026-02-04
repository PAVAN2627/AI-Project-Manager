import { Router } from 'express'

import { createChatCompletion } from '../services/azureOpenAIService.js'

export const azureOpenAIRouter = Router()

function normalizeMessages(body) {
  if (Array.isArray(body?.messages)) {
    const allValid = body.messages.every(
      (message) =>
        message &&
        typeof message === 'object' &&
        typeof message.role === 'string' &&
        message.role.trim() !== '' &&
        typeof message.content === 'string' &&
        message.content.trim() !== '',
    )

    if (!allValid) {
      return { ok: false, error: "Invalid 'messages' format" }
    }

    return { ok: true, messages: body.messages }
  }

  if (typeof body?.prompt === 'string' && body.prompt.trim() !== '') {
    return { ok: true, messages: [{ role: 'user', content: body.prompt }] }
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
    res.status(500).json({ error: message })
  }
})
