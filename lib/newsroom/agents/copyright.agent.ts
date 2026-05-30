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

export async function copyrightAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a copyright review AI. Check this article for copyright issues.

Title: ${input.metadata.title}
Content: ${input.currentContent}
Source: ${JSON.stringify(input.sourceData)}
Legal Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with copyright annotations",
  "stageReport": {
    "plagiarismScore": 0.0-1.0,
    "similarSources": ["source1", "source2"],
    "flaggedSegments": ["segment1", "segment2"],
    "attributionNeeded": boolean,
    "copyrightVerdict": "CLEAR|BLOCKED",
    "copyrightNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('COPYRIGHT', prompt, 0.2, 1000)
  const processingMs = Date.now() - startTime

  // HARD RULE: If plagiarism score > 0.60 or copyright verdict is BLOCKED, BLOCK the pipeline
  if (result.data.stageReport.plagiarismScore > 0.6 || result.data.stageReport.copyrightVerdict === 'BLOCKED') {
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
