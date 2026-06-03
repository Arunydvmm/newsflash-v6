import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function extractAgent(input: AgentInput) {
  const startTime = Date.now()

  const scoutReport = input.allPreviousReports['SCOUT']?.report || {}
  const researchBrief = JSON.stringify(scoutReport.research || {})

  const prompt = `
You are a data extraction and fact verification expert. Using the research brief provided, extract a strict schema and verify each field.

Research brief: ${researchBrief}
Original headline: "${input.metadata.title}"
Original snippet: "${input.currentContent?.slice(0, 300) ?? ''}"

Extract and verify:
{
  "schema": {
    "headline": "max 70 chars, active voice",
    "subheadline": "max 120 chars",
    "category": "",
    "organization": "",
    "keyPeople": [{"name": "", "role": ""}],
    "importantDates": [{"date": "", "significance": ""}],
    "locations": [],
    "statistics": [{"value": "", "context": ""}],
    "officialSources": [],
    "summary": "2 sentences max, facts only"
  },
  "verification": {
    "factScore": 0.0-1.0,
    "flaggedFields": [{"field": "", "reason": ""}],
    "overallVerification": "VERIFIED|PARTIAL|FAILED"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|BLOCK",
  "blockReason": ""
}

Block ONLY if factScore below 0.30 (critical failure). PARTIAL verification is acceptable. Return JSON only.
`

  const result = await callAgent('EXTRACT', prompt, 700, input.jobId)
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
