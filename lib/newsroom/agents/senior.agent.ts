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

export async function seniorAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a senior editor. Edit and improve this article.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Junior Draft Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "edited article",
  "stageReport": {
    "editsMade": ["edit1", "edit2"],
    "styleImprovements": ["improvement1"],
    "clarityScore": 0.0-1.0,
    "readabilityScore": 0.0-1.0,
    "editNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('SENIOR_EDIT', prompt, 0.3, 2000)
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
