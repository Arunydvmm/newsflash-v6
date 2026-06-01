import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function chiefAgent(input: AgentInput) {
  const startTime = Date.now()

  const scoutScore = input.allPreviousReports['SCOUT']?.confidence ?? 0
  const extractScore = input.allPreviousReports['EXTRACT']?.confidence ?? 0
  const writeScore = input.allPreviousReports['WRITE']?.confidence ?? 0
  const reviewScore = input.allPreviousReports['REVIEW']?.confidence ?? 0

  const writeReport = input.allPreviousReports['WRITE']?.report || {}
  const reviewReport = input.allPreviousReports['REVIEW']?.report || {}
  const extractReport = input.allPreviousReports['EXTRACT']?.report || {}

  const wordCount = writeReport.wordCount || 0
  const seoScore = reviewReport.seo?.seoScore || 0
  const safetyPassed = reviewReport.safety?.overallSafe ?? true
  const anyBlocks = Object.values(input.allPreviousReports).some((r: any) => r?.recommendation === 'BLOCK')

  const headline = writeReport.article?.headline || input.metadata.title

  const prompt = `
You are the Chief Editor of NewsFlash, India's leading news portal. Review this complete pipeline report and make the final publish decision.

PIPELINE SUMMARY:
Scout score:    ${scoutScore.toFixed(2)}
Extract score:  ${extractScore.toFixed(2)}
Write score:    ${writeScore.toFixed(2)}
Review score:   ${reviewScore.toFixed(2)}
Headline:       "${headline}"
Word count:     ${wordCount}
SEO score:      ${seoScore.toFixed(2)}
Safety passed:  ${safetyPassed}
Any blocks:     ${anyBlocks}

GRADING:
Grade A: all scores above 0.8, wordCount 2500-3500, safety passed, no blocks
Grade B: all scores above 0.65, wordCount 2500-3500, safety passed, no blocks
Grade C: any score 0.5-0.65 — hold for human review
REWRITE:  wordCount outside range OR extract score below 0.6
REJECT:   any block flag OR safety failed

Only Grade A or B → PUBLISH_NOW
Grade C → HOLD_FOR_REVIEW
REWRITE/REJECT → never publish

Return JSON only:
{
  "editorialGrade": "A|B|C|REWRITE|REJECT",
  "overallScore": 0.0-1.0,
  "decision": "PUBLISH_NOW|HOLD_FOR_REVIEW|REWRITE|REJECT",
  "decisionReason": "",
  "finalCategory": "",
  "finalTags": [],
  "scheduleSuggestion": "immediate|morning|evening",
  "editorNotes": ""
}
`

  const result = await callAgent('CHIEF', prompt, 800, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport || result.data,
    confidence: result.data.confidence ?? 0.7,
    recommendation: result.data.decision === 'PUBLISH_NOW' ? 'PROCEED' : result.data.decision === 'HOLD_FOR_REVIEW' ? 'ESCALATE' : 'BLOCK',
    blockReason: result.data.decisionReason,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
