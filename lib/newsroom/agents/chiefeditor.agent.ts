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

export async function chiefeditorAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a chief editor. Final quality check and grade this article.

EXPLICIT INSTRUCTION:
- Review ALL previous stage reports (not just SEO)
- Check overall consistency across all stages
- Assign final grade A/B/C/REWRITE/REJECT
- Only grade A or B should proceed
- Grade C or below returns BLOCK

Review all previous stage reports:
- Monitoring: Newsworthiness, fake news signals, source credibility
- Research: 5 Ws, verifiable claims, credibility scores
- Extraction: Required fields completeness
- Fact Check: Claims verification, India context
- Junior Draft: Word count, structure, originality
- Senior Edit: Headline length, 5 Ws in lead, paragraph count
- Bias Review: Flagged sentences, neutral replacements
- Legal Review: Sub-judice matters, defamation risk
- Copyright: Similarity score, verbatim matches
- SEO: Meta title/description, URL slug, keyword placement

Grading criteria:
- Grade A: Excellent quality, all stages passed, ready to publish
- Grade B: Good quality, minor issues, can proceed with minor edits
- Grade C: Acceptable but needs significant rewrite - BLOCK
- Grade REWRITE: Major issues, complete rewrite required - BLOCK
- Grade REJECT: Unacceptable quality, fundamental problems - BLOCK

Title: ${input.metadata.title}
Content: ${input.currentContent}
SEO Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "final polished article",
  "stageReport": {
    "editorialGrade": "A|B|C|REWRITE|REJECT",
    "overallQuality": 0.0-1.0,
    "consistencyCheck": "PASS|FAIL",
    "allStagesReviewed": boolean,
    "stageSummary": {
      "monitoring": "PASS|FAIL",
      "research": "PASS|FAIL",
      "extraction": "PASS|FAIL",
      "factcheck": "PASS|FAIL",
      "junior": "PASS|FAIL",
      "senior": "PASS|FAIL",
      "bias": "PASS|FAIL",
      "legal": "PASS|FAIL",
      "copyright": "PASS|FAIL",
      "seo": "PASS|FAIL"
    },
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "finalNotes": "notes",
    "readyForPublish": boolean
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

If grade is C, REWRITE, or REJECT, set recommendation to "BLOCK".
Only grade A or B should have recommendation "PROCEED".
`

  const result = await callAIProvider('CHIEF_EDITOR', prompt, 0.3, 2000)
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
