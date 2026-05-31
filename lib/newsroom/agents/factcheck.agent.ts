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

export async function factcheckAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a fact-checking AI. Verify all claims in this article.

EXPLICIT INSTRUCTION: Verify each date and statistic against what is plausible for India context.
- Check if dates are realistic (e.g., not future dates for past events)
- Verify statistics are within plausible ranges for India's population/economy
- Check if numbers make sense in the Indian context (crores, lakhs, etc.)
- Validate government schemes, budget allocations, policy numbers
- Cross-check election results, population figures, economic data

Flag any claim that cannot be verified as UNVERIFIED (not just low confidence):
- If a claim lacks credible sources, mark as UNVERIFIED
- If statistics are presented without attribution, mark as UNVERIFIED
- If dates are vague or ambiguous, mark as UNVERIFIED
- If claims contradict known facts, mark as FALSE
- If claims are plausible but unverified, mark as UNVERIFIED (not just low confidence)

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
        "verdict": "TRUE|FALSE|MIXED|UNVERIFIED",
        "confidence": 0.0-1.0,
        "sources": ["source1"],
        "indiaContextCheck": "plausible|implausible|verified",
        "notes": "explanation of verification"
      }
    ],
    "overallAccuracy": 0.0-1.0,
    "falseClaims": 0,
    "unverifiedClaims": 0,
    "factCheckNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('FACT_CHECK', prompt, 0.2, 2000)
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
