import { callGroqFast } from '../groq.service'

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

export async function monitoringAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a news monitoring AI for ${input.metadata.region} news.
Analyze this article and determine if it's worth processing.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Source: ${JSON.stringify(input.sourceData)}

Return JSON:
{
  "modifiedContent": "improved headline if needed",
  "stageReport": {
    "newsworthinessScore": 0-100,
    "priority": "BREAKING|STANDARD|FEATURE",
    "category": "India|World|Business|Technology|Sports|Science|Health|Entertainment|Opinion|Cricket|Sarkari|Education",
    "isBreaking": boolean,
    "monitoringNotes": "brief notes",
    "region": "detected region"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callGroqFast(prompt, 0.2)
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
