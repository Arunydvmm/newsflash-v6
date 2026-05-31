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

EXPLICIT INSTRUCTION:
- Check if any phrase over 5 words matches the source snippet verbatim
- Flag verbatim matches that could indicate copying
- Return similarityScore between 0-1 (0 = no similarity, 1 = identical)
- Block if similarityScore is above 0.1 (10% similarity threshold)

Copyright analysis:
- Compare article content against source material
- Identify verbatim phrases (5+ words identical)
- Calculate overall similarity percentage
- Check for proper attribution of quotes and sources
- Identify potential plagiarism or unauthorized copying

Similarity scoring:
- 0.0-0.05: Minimal similarity, acceptable
- 0.05-0.10: Low similarity, review recommended
- 0.10-0.30: Moderate similarity, rewrite required
- 0.30+: High similarity, BLOCK

Title: ${input.metadata.title}
Content: ${input.currentContent}
Source: ${JSON.stringify(input.sourceData)}
Legal Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with copyright annotations",
  "stageReport": {
    "similarityScore": 0.0-1.0,
    "verbatimMatches": [
      {
        "phrase": "matching phrase (5+ words)",
        "length": number,
        "location": "where it appears"
      }
    ],
    "similarSources": ["source1", "source2"],
    "flaggedSegments": ["segment1", "segment2"],
    "attributionNeeded": boolean,
    "attributionProvided": boolean,
    "copyrightVerdict": "CLEAR|BLOCKED",
    "copyrightNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

If similarityScore > 0.1, set recommendation to "BLOCK" and copyrightVerdict to "BLOCKED".
`

  const result = await callAIProvider('COPYRIGHT', prompt, 0.2, 1000)
  const processingMs = Date.now() - startTime

  // HARD RULE: If similarityScore > 0.1 or copyright verdict is BLOCKED, BLOCK the pipeline
  if (result.data.stageReport.similarityScore > 0.1 || result.data.stageReport.copyrightVerdict === 'BLOCKED') {
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
