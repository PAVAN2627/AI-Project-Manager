import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { azureOpenAIRouter } from './routes/azureOpenAI.js'
import { healthRouter } from './routes/health.js'
import { getOptionalEnvNumber } from './utils/env.js'

dotenv.config()
dotenv.config({ path: '.env.local' })

const defaultCorsOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : defaultCorsOrigin

const app = express()

app.use(
  cors({
    origin: corsOrigin,
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/azure-openai', azureOpenAIRouter)

const port = getOptionalEnvNumber('PORT', 5174)
app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`)
})
