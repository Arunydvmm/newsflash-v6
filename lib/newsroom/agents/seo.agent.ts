import { callGroq } from '../groq.service'

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

export async function seoAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are an SEO optimization AI. Optimize this article for search engines.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Copyright Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "SEO-optimized content",
  "stageReport": {
    "metaTitle": "optimized title",
    "metaDescription": "optimized description",
    "keywords": ["keyword1", "keyword2"],
    "headingStructure": "H1|H2|H3",
    "readabilityScore": 0.0-1.0,
    "seoScore": 0.0-1.0,
    "seoNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callGroq(prompt, 0.3)
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
