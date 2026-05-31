import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function safetyAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are a content safety and compliance AI. Review this article for safety issues.

Check for the following safety concerns:

1. LEGAL RISKS:
   - Defamation or libelous statements about individuals/organizations
   - Unsubstantiated criminal accusations
   - Privacy violations (personal info, addresses, private data)
   - Contempt of court or sub judice matters
   - Breach of national security

2. HARMFUL CONTENT:
   - Hate speech, discrimination, or incitement to violence
   - Self-harm or suicide promotion
   - Dangerous activities or illegal acts
   - Misinformation that could cause public harm
   - Medical misinformation without proper disclaimers

3. SENSITIVE TOPICS (India-specific):
   - Religious tensions or communal violence
   - Political polarization during elections
   - Military/defense operational details
   - Ongoing legal cases under judicial consideration
   - Government classified information

4. FACTUAL ACCURACY:
   - Verifiable factual errors
   - Misleading statistics or data
   - Outdated information presented as current
   - Conflicting information within the article

Article Content: ${input.currentContent}
Previous Reports: ${JSON.stringify(input.allPreviousReports)}

Return JSON:
{
  "modifiedContent": input.currentContent (no changes expected),
  "stageReport": {
    "legalRisks": {
      "defamationRisk": "NONE|LOW|MEDIUM|HIGH",
      "privacyViolation": "NONE|LOW|MEDIUM|HIGH",
      "contemptRisk": "NONE|LOW|MEDIUM|HIGH",
      "details": ["specific concern1", "concern2"]
    },
    "harmfulContent": {
      "hateSpeech": boolean,
      "violenceIncitement": boolean,
      "selfHarm": boolean,
      "dangerousActivities": boolean,
      "medicalMisinfo": boolean,
      "details": ["specific concern1", "concern2"]
    },
    "sensitiveTopics": {
      "communalTension": boolean,
      "politicalPolarization": boolean,
      "defenseInfo": boolean,
      "subJudice": boolean,
      "classifiedInfo": boolean,
      "details": ["specific concern1", "concern2"]
    },
    "factualAccuracy": {
      "errorsFound": ["error1", "error2"],
      "misleadingInfo": ["info1", "info2"],
      "accuracyScore": 0.0-1.0
    },
    "overallSafetyScore": 0.0-1.0,
    "safetyNotes": "overall assessment"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

Set recommendation to "BLOCK" if any HIGH risk issues are found.
Set recommendation to "REWRITE" if MEDIUM risk issues need addressing.
`

  const result = await callAgent('SAFETY', prompt, 2000, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    blockReason: result.data.recommendation === 'BLOCK' ? 'Safety concerns detected' : undefined,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
