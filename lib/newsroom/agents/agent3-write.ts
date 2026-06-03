import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function writeAgent(input: AgentInput) {
  const startTime = Date.now()

  const schema = input.allPreviousReports['EXTRACT']?.report?.schema || {}

  const prompt = `
You are a senior news writer. Write a publication-ready news article from this verified schema.

Schema: ${JSON.stringify(schema)}

REQUIREMENTS:
- Length: 800-1500 words (flexible — quality over length)
- Structure: inverted pyramid
- Lead paragraph answers all 5 Ws
- Short paragraphs: max 3 sentences (mobile-first)
- Subheadings (##) every 3-4 paragraphs
- Active voice throughout
- India-appropriate tone
- Write entirely from schema — never copy source text

INCLUDE AT LEAST 1 OF THESE:
1. Key Facts table
2. Important Dates timeline
3. Data/statistics table
4. Key Takeaways bullet list

All tables max 4 columns (mobile constraint).

Return JSON only:
{
  "article": {
    "headline": "",
    "subheadline": "",
    "body": "full markdown 800-1500 words",
    "metaTitle": "under 60 chars",
    "metaDescription": "under 160 chars",
    "tags": [],
    "slug": "url-slug"
  },
  "wordCount": 0,
  "tablesIncluded": 0,
  "confidence": 0.0-1.0
}

Note: Return confidence 0.7+ if article has coherent content. Only return very low confidence if article is unintelligible or empty.
`

  const result = await callAgent('WRITE', prompt, 3000, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport || result.data,
    confidence: result.data.confidence ?? 0.7,
    recommendation: 'PROCEED', // Always PROCEED from Write Agent - let downstream stages decide
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
