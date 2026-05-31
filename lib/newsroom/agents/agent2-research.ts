import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function researchAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are a news research AI. Research this article and gather additional context.

Identify the 5 Ws (Who, What, When, Where, Why):
- WHO: Key people, organizations, government bodies involved
- WHAT: The core event, announcement, or development
- WHEN: Specific dates, timelines, deadlines
- WHERE: Geographic locations, venues, regions
- WHY: Reasons, motivations, context, implications

List verifiable claims separately:
- Extract each factual claim that can be independently verified
- Note statistics, numbers, percentages that need verification
- Identify official statements, government announcements
- Mark claims that require official sources for confirmation

Assign a credibilityScore per claim (not just overall):
- Direct quotes from officials: 0.9-1.0
- Official press releases: 0.8-0.95
- Named sources with attribution: 0.7-0.85
- Anonymous sources: 0.4-0.6
- Unverified claims: 0.0-0.3

Title: ${input.metadata.title}
Content: ${input.currentContent}
Monitoring Report: ${JSON.stringify(input.allPreviousReports['MONITOR']?.report || {})}

Return JSON:
{
  "modifiedContent": "enhanced content with research findings",
  "stageReport": {
    "fiveWs": {
      "who": ["person/organization1", "person/organization2"],
      "what": "core event description",
      "when": ["date1", "date2"],
      "where": ["location1", "location2"],
      "why": "reasons and context"
    },
    "verifiableClaims": [
      {
        "claim": "claim text",
        "credibilityScore": 0.0-1.0,
        "sourceType": "official|named|anonymous|unverified",
        "verificationNeeded": boolean
      }
    ],
    "keyFacts": ["fact1", "fact2"],
    "relatedEvents": ["event1", "event2"],
    "historicalContext": "context",
    "sourcesFound": ["source1", "source2"],
    "overallCredibility": 0.0-1.0,
    "researchNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAgent('RESEARCH', prompt, 1500, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
