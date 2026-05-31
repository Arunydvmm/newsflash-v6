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

export async function legalAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a legal review AI. Check this article for legal issues.

EXPLICIT INSTRUCTION:
- Check for active court cases (sub-judice matters) - reporting on ongoing litigation can be contempt of court
- Check for statements about living individuals that could be defamatory
- Check for unverified criminal allegations against named individuals
- Any high-risk flag must return BLOCK (not ESCALATE)

Legal risks to check:
- Defamation: False statements harming reputation of individuals/organizations
- Libel: Written defamatory statements
- Contempt of court: Reporting on sub-judice matters that could prejudice proceedings
- Privacy: Invasion of privacy, revealing private information without consent
- Copyright: Unauthorized use of copyrighted material
- Sedition: Statements inciting violence against the government

High-risk scenarios (must BLOCK):
- Unverified criminal allegations against named individuals
- Reporting on active court cases with potential to prejudice proceedings
- Defamatory statements about living individuals without evidence
- Statements that could incite violence or public disorder

Title: ${input.metadata.title}
Content: ${input.currentContent}
Bias Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "content with legal annotations",
  "stageReport": {
    "legalIssues": ["defamation|libel|copyright|privacy|contempt_of_court|sedition|none"],
    "flaggedContent": [
      {
        "content": "flagged text",
        "issue": "defamation|libel|copyright|privacy|contempt_of_court|sedition",
        "riskLevel": "HIGH|MEDIUM|LOW",
        "reason": "explanation"
      }
    ],
    "subJudiceMatters": boolean,
    "defamationRisk": boolean,
    "privacyRisk": boolean,
    "overallRiskLevel": "NONE|LOW|MEDIUM|HIGH",
    "legalVerdict": "CLEAR|BLOCKED",
    "legalNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

If any high-risk flag is detected, set recommendation to "BLOCK" and legalVerdict to "BLOCKED".
`

  const result = await callAIProvider('LEGAL_REVIEW', prompt, 0.2, 2000)
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
