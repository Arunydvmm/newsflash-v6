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

export async function legalAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a legal review AI. Check this article for legal issues.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Bias Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with legal annotations",
  "stageReport": {
    "legalIssues": ["defamation|libel|copyright|privacy|none"],
    "flaggedContent": ["content1", "content2"],
    "riskLevel": "NONE|LOW|MEDIUM|HIGH",
    "legalVerdict": "CLEAR|BLOCKED",
    "legalNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callGeminiPro(prompt, 0.2)
  const processingMs = Date.now() - startTime

  // HARD RULE: If legal verdict is BLOCKED, BLOCK the pipeline
  if (result.data.stageReport.legalVerdict === 'BLOCKED') {
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
