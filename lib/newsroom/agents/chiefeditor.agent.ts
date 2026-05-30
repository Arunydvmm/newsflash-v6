import { callGeminiPro } from '../gemini.service'

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

export async function chiefeditorAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a chief editor. Final quality check and grade this article.

Title: ${input.metadata.title}
Content: ${input.currentContent}
SEO Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "final polished article",
  "stageReport": {
    "editorialGrade": "A|B|C|REWRITE|REJECT",
    "overallQuality": 0.0-1.0,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "finalNotes": "notes",
    "readyForPublish": boolean
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callGeminiPro(prompt, 0.3)
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
