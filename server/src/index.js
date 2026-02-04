import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { authRouter } from './routes/auth.js'
import { azureOpenAIRouter } from './routes/azureOpenAI.js'
import { healthRouter } from './routes/health.js'
import { getOptionalEnvNumber } from './utils/env.js'

const isProduction = process.env.NODE_ENV === 'production'
if (!isProduction) {
  dotenv.config({ path: '.env' })
  dotenv.config({ path: '.env.local', override: true })
} else {
  dotenv.config({ path: '.env' })
}

const defaultCorsOrigin = isProduction
  ? false
  : /^http:\/\/(localhost|127\.0\.0\.1):\d+$/

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : null

const corsOptions = allowedOrigins
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(null, false)
      },
    }
  : { origin: defaultCorsOrigin }

const app = express()

app.use(cors(corsOptions))

app.use(express.json({ limit: '1mb' }))

app.use('/api', authRouter)
app.use('/api/health', healthRouter)
app.use('/api/azure-openai', azureOpenAIRouter)

const port = getOptionalEnvNumber('PORT', 5174)
app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`)
})
