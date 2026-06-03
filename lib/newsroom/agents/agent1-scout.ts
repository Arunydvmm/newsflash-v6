import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function scoutAgent(input: AgentInput) {
  const startTime = Date.now()

  console.log(`[Scout Agent] Starting for job ${input.jobId}`)

  const prompt = `
You are a news scout and researcher combined. Given this news headline and snippet, do TWO tasks in one pass:

TASK 1 — MONITOR:
- Score newsworthiness 1-10 for Indian audience
- Detect fake news signals (sensational language, unverified claims)
- Identify category: POLITICS|BUSINESS|TECH|SPORTS|CRIME|HEALTH|INTERNATIONAL|OTHER
- Assign priority: URGENT|HIGH|STANDARD|LOW
- Block ONLY if score below 2 (severe low quality) OR obvious fake news detected (be lenient - only block if very suspicious)

TASK 2 — RESEARCH (only if not blocked):
- Extract 5 Ws: WHO, WHAT, WHEN, WHERE, WHY
- List all verifiable claims with confidence 0.0-1.0
- Identify source credibility: HIGH|MEDIUM|LOW
- Note any information gaps

Headline: "${input.metadata.title}"
Snippet: "${input.currentContent?.slice(0, 400) ?? ''}"
Source: "${input.sourceData?.sourceName ?? 'Unknown'}"
Published: "${input.sourceData?.publishedAt ?? 'Unknown'}"

Return JSON only — no markdown, no explanation:
{
  "monitor": {
    "newsworthinessScore": 0-10,
    "isFakeNewsRisk": false,
    "fakeNewsSignals": [],
    "category": "",
    "priority": "URGENT|HIGH|STANDARD|LOW",
    "blockReason": ""
  },
  "research": {
    "fiveWs": {
      "who": [{"name": "", "role": ""}],
      "what": "",
      "when": [],
      "where": [],
      "why": ""
    },
    "verifiableClaims": [{"claim": "", "confidence": 0.0}],
    "sourceCredibility": "HIGH|MEDIUM|LOW",
    "informationGaps": [],
    "researchScore": 0.0
  },
  "confidence": 0.0-1.0
}
`

  const result = await callAgent('SCOUT', prompt, 800, input.jobId)
  const processingMs = Date.now() - startTime

  console.log(`[Scout Agent] Completed for job ${input.jobId}`, {
    processingMs,
    hasData: !!result.data,
    recommendation: result.data?.recommendation
  })

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport || result.data,
    confidence: result.data.confidence ?? 0.7,
    recommendation: result.data.monitor?.newsworthinessScore >= 2 ? 'PROCEED' : 'BLOCK', // Only BLOCK if score < 2
    blockReason: result.data.blockReason,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
