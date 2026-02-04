import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { azureOpenAIRouter } from './routes/azureOpenAI.js'
import { healthRouter } from './routes/health.js'
import { getOptionalEnvNumber } from './utils/env.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()

app.use(
  cors({
    origin: true,
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use('/api/health', healthRouter)
app.use('/api/azure-openai', azureOpenAIRouter)

const port = getOptionalEnvNumber('PORT', 5174)
app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`)
})
