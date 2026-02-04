import { getRequiredEnv } from '../utils/env.js'

function parseJsonOrText(bodyText) {
  try {
    return JSON.parse(bodyText)
  } catch {
    return bodyText
  }
}

export async function createChatCompletion({ messages, temperature = 0.2 }) {
  const url = getRequiredEnv('AZURE_OPENAI_CHAT_COMPLETIONS_URL')
  const apiKey = getRequiredEnv('AZURE_OPENAI_API_KEY')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature,
    }),
  })

  const bodyText = await response.text()
  const parsed = parseJsonOrText(bodyText)

  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'error' in parsed
        ? JSON.stringify(parsed.error)
        : typeof parsed === 'string'
          ? parsed
          : JSON.stringify(parsed)

    const error = new Error(`Azure OpenAI request failed (${response.status}): ${message}`)
    error.cause = parsed
    throw error
  }

  return parsed
}
