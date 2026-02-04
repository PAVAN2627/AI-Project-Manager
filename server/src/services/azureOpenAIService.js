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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
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
      signal: controller.signal,
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
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Azure OpenAI returned a non-JSON response')
    }

    if (!('choices' in parsed) || !Array.isArray(parsed.choices)) {
      throw new Error('Azure OpenAI response is missing an expected "choices" array')
    }

    return parsed
  } finally {
    clearTimeout(timeout)
  }
}
