import { callAgent } from '../agent-caller'

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

export async function monitoringAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are a news monitoring AI for ${input.metadata.region} news. Analyze this article and determine if it's worth processing.

Apply India-specific newsworthiness criteria:
- Government announcements, policy changes, economic reforms
- Breaking news with immediate public impact
- Major infrastructure developments, defense updates
- Significant sports events (especially cricket), entertainment news
- Health alerts, natural disasters, public safety issues
- Elections, political developments, diplomatic matters

Check for fake news signals:
- Unverified sensational claims without credible sources
- Clickbait headlines with exaggerated language
- Anonymous sources without attribution
- Inconsistent timelines or contradictory facts
- Spammy URLs from unknown domains

Evaluate source credibility:
- NDTV, The Hindu, Times of India, Indian Express: HIGH credibility
- Regional newspapers with established reputation: MEDIUM-HIGH credibility
- Unknown blogs, social media posts: LOW credibility
- Government official sources: HIGH credibility for official statements

Title: ${input.metadata.title}
Content: ${input.currentContent}
Source: ${JSON.stringify(input.sourceData)}

Return JSON:
{
  "modifiedContent": "improved headline if needed",
  "stageReport": {
    "newsworthinessScore": 0-100,
    "priority": "BREAKING|STANDARD|FEATURE",
    "category": "India|World|Business|Technology|Sports|Science|Health|Entertainment|Opinion|Cricket|Sarkari|Education",
    "isBreaking": boolean,
    "region": "detected region (e.g., 'India', 'Delhi', 'Mumbai', 'Karnataka')",
    "fakeNewsSignals": ["signal1", "signal2"],
    "sourceCredibility": "HIGH|MEDIUM|LOW",
    "monitoringNotes": "brief notes explaining your assessment"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAgent('MONITOR', prompt, 1000, input.articleId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.7,
    recommendation: result.data.recommendation || 'PROCEED',
    tokensUsed: result.tokensUsed,
    processingMs
  }
}
