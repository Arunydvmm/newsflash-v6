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

export async function factcheckAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a fact-checking AI. Verify all claims in this article.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Extraction Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with fact-check annotations",
  "stageReport": {
    "claims": [
      {
        "claim": "claim text",
        "verdict": "TRUE|FALSE|MIXED|UNVERIFIABLE",
        "confidence": 0.0-1.0,
        "sources": ["source1"]
      }
    ],
    "overallAccuracy": 0.0-1.0,
    "falseClaims": 0,
    "factCheckNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callGeminiPro(prompt, 0.2)
  const processingMs = Date.now() - startTime

  const falseClaims = result.data.stageReport.claims?.filter((c: any) => c.verdict === 'FALSE').length || 0

  // HARD RULE: If there are false claims, BLOCK
  if (falseClaims > 0) {
    return {
      modifiedContent: input.currentContent,
      stageReport: result.data.stageReport,
      confidence: result.data.confidence || 0.5,
      recommendation: 'BLOCK',
      tokensUsed: result.tokensUsed,
      processingMs
    }
  }

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    tokensUsed: result.tokensUsed,
    processingMs
  }
}
