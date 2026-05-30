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

export async function extractionAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a content extraction AI. Extract key information from this article.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Research Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "structured article content",
  "stageReport": {
    "keyPoints": ["point1", "point2"],
    "entities": ["entity1", "entity2"],
    "dates": ["date1", "date2"],
    "locations": ["location1", "location2"],
    "quotes": ["quote1", "quote2"],
    "extractionQuality": 0.0-1.0
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('EXTRACTION', prompt, 0.3, 2000)
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
