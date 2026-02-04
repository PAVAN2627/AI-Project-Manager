import { Router } from 'express'

import { createChatCompletion } from '../services/azureOpenAIService.js'

export const azureOpenAIRouter = Router()

function normalizeMessages(body) {
  if (Array.isArray(body?.messages)) {
    return body.messages
  }

  if (typeof body?.prompt === 'string' && body.prompt.trim() !== '') {
    return [{ role: 'user', content: body.prompt }]
  }

  return null
}

azureOpenAIRouter.post('/chat', async (req, res) => {
  const messages = normalizeMessages(req.body)
  if (!messages) {
    res.status(400).json({
      error: 'Provide either {"prompt": string} or {"messages": [{"role":"user","content":"..."}] }',
    })
    return
  }

  try {
    const data = await createChatCompletion({ messages })
    res.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})
