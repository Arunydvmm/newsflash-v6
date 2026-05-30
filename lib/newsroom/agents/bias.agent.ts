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

export async function biasAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a bias detection AI. Check this article for bias.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Senior Edit Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with bias annotations",
  "stageReport": {
    "biasTypes": ["political|cultural|gender|religious|none"],
    "biasedPhrases": ["phrase1", "phrase2"],
    "neutralPhrases": ["phrase1", "phrase2"],
    "overallBias": "NONE|LOW|MEDIUM|HIGH",
    "biasScore": 0.0-1.0,
    "biasNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('BIAS_REVIEW', prompt, 0.3, 2000)
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
