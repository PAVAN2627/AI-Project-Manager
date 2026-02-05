import { getOptionalEnv, getRequiredEnv } from '../utils/env.js'

function tryParseJson(bodyText) {
  try {
    return JSON.parse(bodyText)
  } catch {
    return null
  }
}

function normalizeAzureEndpoint(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function getAzureChatCompletionsUrl() {
  const explicitUrl = getOptionalEnv('AZURE_OPENAI_CHAT_COMPLETIONS_URL', null)
  if (explicitUrl) return explicitUrl

  const endpoint = normalizeAzureEndpoint(getOptionalEnv('AZURE_OPENAI_ENDPOINT', null))
  const deployment = getOptionalEnv('AZURE_OPENAI_DEPLOYMENT', null)
  const apiVersion = getOptionalEnv('AZURE_OPENAI_API_VERSION', null)

  if (!endpoint || !deployment || !apiVersion) {
    throw new Error(
      [
        'Missing Azure OpenAI config. Provide either:',
        '- AZURE_OPENAI_CHAT_COMPLETIONS_URL (full chat/completions URL)',
        'or:',
        '- AZURE_OPENAI_ENDPOINT',
        '- AZURE_OPENAI_DEPLOYMENT',
        '- AZURE_OPENAI_API_VERSION',
      ].join(' '),
    )
  }

  const normalizedDeployment = deployment.trim()
  if (!normalizedDeployment) {
    throw new Error('Missing required environment variable: AZURE_OPENAI_DEPLOYMENT')
  }

  const normalizedApiVersion = apiVersion.trim()
  if (!normalizedApiVersion) {
    throw new Error('Missing required environment variable: AZURE_OPENAI_API_VERSION')
  }

  return `${endpoint}/openai/deployments/${encodeURIComponent(
    normalizedDeployment,
  )}/chat/completions?api-version=${encodeURIComponent(normalizedApiVersion)}`
}

function getAzureApiKey() {
  const newKey = getOptionalEnv('AZURE_OPENAI_KEY', null)
  if (newKey) return newKey

  // Back-compat: older env name used by the existing `/api/azure-openai/chat` endpoint.
  return getRequiredEnv('AZURE_OPENAI_API_KEY')
}

export async function createChatCompletion({ messages, temperature = 0.2 }) {
  const url = getAzureChatCompletionsUrl()
  const apiKey = getAzureApiKey()

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
