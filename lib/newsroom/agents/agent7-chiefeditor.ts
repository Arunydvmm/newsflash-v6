import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function chiefEditorAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are the Chief Editor AI. Make the final editorial decision on this article.

Review all previous agent reports and make a comprehensive assessment.

Review criteria:
1. NEWSWORTHINESS (from Monitor): Is this story worth publishing?
2. RESEARCH QUALITY (from Research): Is the research thorough and credible?
3. EXTRACTION ACCURACY (from Extract/Verify): Are all facts correctly extracted?
4. WRITING QUALITY (from Write): Is the article well-written and engaging?
5. SAFETY COMPLIANCE (from Safety): Does it meet safety and legal standards?
6. SEO READINESS (from SEO Polish): Is it optimized for search engines?

Editorial grading scale:
- Grade A: Excellent quality, ready to publish immediately
- Grade B: Good quality, minor issues acceptable for publication
- Grade C: Fair quality, needs revisions before publication
- Grade D: Poor quality, significant rewrite required
- Grade REJECT: Unpublishable, fundamental issues

Final decision options:
- PUBLISH_NOW: Article is excellent, publish immediately
- PUBLISH_REVIEW: Article is good, publish after human review
- DRAFT_READY: Save as draft for human editor review
- REWRITE_REQUIRED: Needs significant rewriting
- REJECT: Reject article, do not publish

All Agent Reports: ${JSON.stringify(input.allPreviousReports)}
Final Article Content: ${input.currentContent}

Return JSON:
{
  "modifiedContent": input.currentContent (no changes expected),
  "stageReport": {
    "overallScore": 0.0-100,
    "editorialGrade": "A|B|C|D|REJECT",
    "decision": "PUBLISH_NOW|PUBLISH_REVIEW|DRAFT_READY|REWRITE_REQUIRED|REJECT",
    "decisionReason": "detailed explanation for the decision",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "requiredChanges": ["change1", "change2"] if any,
    "stageAssessments": {
      "monitor": "assessment",
      "research": "assessment",
      "extraction": "assessment",
      "writing": "assessment",
      "safety": "assessment",
      "seo": "assessment"
    },
    "finalCategory": "final category assignment",
    "finalTags": ["tag1", "tag2", "tag3"],
    "editorNotes": "additional editorial comments"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

Set recommendation to match decision:
- PUBLISH_NOW or PUBLISH_REVIEW: "PROCEED"
- DRAFT_READY: "PROCEED" (will be saved as draft)
- REWRITE_REQUIRED: "REWRITE"
- REJECT: "BLOCK"
`

  const result = await callAgent('CHIEF_EDITOR', prompt, 1000, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.9,
    recommendation: result.data.recommendation || 'PROCEED',
    blockReason: result.data.recommendation === 'BLOCK' ? result.data.stageReport?.decisionReason : undefined,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
