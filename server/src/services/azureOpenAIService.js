import { getRequiredEnv } from '../utils/env.js'

function tryParseJson(bodyText) {
  try {
    return JSON.parse(bodyText)
  } catch {
    return null
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

  if (!response.ok) {
    const parsed = tryParseJson(bodyText)
    const message =
      parsed && typeof parsed === 'object' && 'error' in parsed
        ? JSON.stringify(parsed.error)
        : bodyText.length > 800
          ? `${bodyText.slice(0, 800)}…`
          : bodyText

    throw new Error(`Azure OpenAI request failed (${response.status}): ${message}`)
  }

  const parsed = tryParseJson(bodyText)
  if (!parsed) {
    throw new Error('Azure OpenAI returned a non-JSON response')
  }

  return parsed
}
