import { callAIProvider } from '../provider.service'

interface AgentInput {
  articleId: string
  currentContent: string
  previousStageReport: object
  sourceData: object
  metadata: { title: string; region: string; priority: string; language: string }
}

interface AgentOutput {
  modifiedContent: string
  stageReport: object
  confidence: number
  recommendation: string
  tokensUsed: number
  processingMs: number
}

export async function researchAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a news research AI. Research this article and gather additional context.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Monitoring Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "enhanced content with research findings",
  "stageReport": {
    "keyFacts": ["fact1", "fact2"],
    "relatedEvents": ["event1", "event2"],
    "historicalContext": "context",
    "sourcesFound": ["source1", "source2"],
    "credibilityScore": 0.0-1.0,
    "researchNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('RESEARCH', prompt, 0.3, 2000)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    tokensUsed: result.tokensUsed,
    processingMs
  }
}
