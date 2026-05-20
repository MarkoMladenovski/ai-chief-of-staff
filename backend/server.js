import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import cors from 'cors'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }))
app.use(express.json({ limit: '10mb' }))

const defaultMessages = JSON.parse(readFileSync(join(__dirname, 'messages.json'), 'utf-8'))

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  Warning: ANTHROPIC_API_KEY is not set. Set it in a .env file or environment.')
}

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an elite AI Chief of Staff for a busy CEO. Your job is to ruthlessly cut through noise, protect the CEO's time, and surface only what demands their direct attention.

Classification rules:
- "ignore": Newsletters, phishing/spam, personal non-work messages, pure FYI updates requiring no follow-up, and issues already fully resolved by others.
- "delegate": Items requiring action but NOT the CEO's personal judgment. Assign to a specific person (COO, Head of People, Engineering Lead, EA, etc.) and draft a complete, ready-to-send handoff note.
- "decide": ONLY items requiring the CEO's direct judgment — investor/board relations, strategic decisions, major financial calls, critical production incidents affecting customers, or things only the CEO can authorise.

Be ruthless. Most messages should be "ignore" or "delegate". Only escalate to "decide" when truly necessary.

Read all messages together before classifying — look for context (a later message resolving an earlier issue), scheduling conflicts, and escalating situations.`

async function runAnalysis(messages) {
  const prompt = `Analyze these ${messages.length} incoming communications for the CEO. Today is Wednesday, March 18, 2026.

<messages>
${JSON.stringify(messages, null, 2)}
</messages>

Read all messages holistically before classifying. Note: some messages update or resolve earlier ones.

Return ONLY a valid JSON object — no markdown fences, no explanation text, just the raw JSON:
{
  "triage": [
    {
      "id": <number>,
      "category": "ignore" | "delegate" | "decide",
      "reason": "<one clear sentence justifying the classification>",
      "assignee": "<specific role or name if delegating, otherwise null>",
      "drafted_response": "<complete ready-to-use response or action note — be specific and actionable>",
      "urgency": "low" | "medium" | "high" | "critical",
      "summary": "<6 words max describing this message>"
    }
  ],
  "flags": [
    {
      "title": "<concise flag title>",
      "description": "<what the CEO needs to know, why it matters, and relevant context>",
      "urgency": "medium" | "high" | "critical",
      "related_message_ids": [<array of related message ids as numbers>]
    }
  ],
  "briefing": "Daily briefing in Markdown using exactly these sections:\\n\\n## ⚡ Immediate Decisions Required\\n## 🏆 Wins & Momentum\\n## ⚠️ Risks & Watch Items\\n## 📅 Today's Schedule\\n## 📋 Delegated (FYI)\\n\\nMax 400 words. Direct, bullet-heavy. This is the first thing the CEO reads."
}`

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}') + 1
  if (start === -1) throw new Error('Model did not return valid JSON')
  return JSON.parse(text.slice(start, end))
}

// Promise-based cache — concurrent requests share a single Claude call
let defaultAnalysisPromise = null

app.get('/api/analyze', async (req, res) => {
  try {
    if (!defaultAnalysisPromise) {
      defaultAnalysisPromise = runAnalysis(defaultMessages).catch(err => {
        defaultAnalysisPromise = null
        throw err
      })
    }
    const analysis = await defaultAnalysisPromise
    res.json({ messages: defaultMessages, analysis })
  } catch (err) {
    console.error('Analysis error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/analyze', async (req, res) => {
  try {
    const { messages } = req.body
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Body must contain a non-empty "messages" array' })
    }
    const analysis = await runAnalysis(messages)
    res.json({ messages, analysis })
  } catch (err) {
    console.error('Analysis error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🤖 AI Chief of Staff API → http://localhost:${PORT}\n`)
})
