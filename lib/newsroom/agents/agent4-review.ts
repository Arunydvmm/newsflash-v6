import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function reviewAgent(input: AgentInput) {
  const startTime = Date.now()

  const writeReport = input.allPreviousReports['WRITE']?.report || {}
  const headline = writeReport.article?.headline || input.metadata.title
  const body = writeReport.article?.body || ''

  const prompt = `
You are a combined safety reviewer and SEO editor. Review this article for ALL of the following in one pass:

Article headline: "${headline}"
Article body (first 1500 chars): "${body?.slice(0, 1500) ?? ''}"

REVIEW 1 — SAFETY (bias + legal + copyright):
- Bias score 0.0-1.0 (0=unbiased)
- Legal risk: any defamation, sub-judice, privacy violations?
- Copyright: any verbatim phrases over 5 words from source?
- Block if: bias > 0.7, any HIGH legal risk, copyright similarity > 0.15

REVIEW 2 — SEO:
- Meta title under 60 chars
- Meta description under 160 chars
- Clean URL slug
- Primary keyword identified
- SEO score 0.0-1.0
- Image search queries for cover + 2 inline images

REVIEW 3 — POLISH:
- Any grammar/spelling issues? (list fixes)
- India number format correct? (lakh/crore not million/billion)
- All tables mobile-friendly (max 4 cols)?

Return JSON only:
{
  "safety": {
    "biasScore": 0.0,
    "legalRisk": "CLEAR|CAUTION|BLOCKED",
    "copyrightScore": 0.0,
    "overallSafe": true
  },
  "seo": {
    "metaTitle": "",
    "metaDescription": "",
    "slug": "",
    "primaryKeyword": "",
    "keywords": [],
    "seoScore": 0.0,
    "imageQueries": {
      "cover": "",
      "inline1": "",
      "inline2": ""
    }
  },
  "polish": {
    "corrections": [],
    "mobileReady": true
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|BLOCK",
  "blockReason": ""
}

Block if safety.overallSafe is false.
`

  const result = await callAgent('REVIEW', prompt, 1000, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport || result.data,
    confidence: result.data.confidence ?? 0.7,
    recommendation: result.data.recommendation || 'PROCEED',
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
