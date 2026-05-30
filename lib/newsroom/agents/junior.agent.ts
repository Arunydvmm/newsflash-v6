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

export async function juniorAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a junior journalist. Write a first draft of this article.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Fact Check Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "first draft article",
  "stageReport": {
    "wordCount": number,
    "structure": "inverted pyramid|chronological|narrative",
    "leadQuality": 0.0-1.0,
    "quotesIncluded": boolean,
    "draftNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('JUNIOR_DRAFT', prompt, 0.4, 2000)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.7,
    recommendation: result.data.recommendation || 'PROCEED',
    tokensUsed: result.tokensUsed,
    processingMs
  }
}
