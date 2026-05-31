import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function writeAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are a professional news writer. Write a complete, engaging news article based on the extracted information.

Writing guidelines:
- Start with a compelling lead paragraph that summarizes the story
- Use inverted pyramid structure (most important info first)
- Write in clear, concise journalistic style
- Include quotes if available (use "said" or "stated" attribution)
- Maintain objectivity and neutrality
- Use active voice where possible
- Keep sentences relatively short and punchy
- Include relevant context and background
- End with a forward-looking conclusion or next steps

Article structure:
1. Headline: Clear, informative, attention-grabbing
2. Lead paragraph: Who, what, when, where, why in 1-2 sentences
3. Body paragraphs: Details, quotes, context in descending importance
4. Background: Relevant history or related events
5. Impact: What this means for readers/stakeholders
6. Conclusion: Next steps or future developments

Extracted Information: ${JSON.stringify(input.allPreviousReports['EXTRACT_VERIFY']?.report || {})}
Research Context: ${JSON.stringify(input.allPreviousReports['RESEARCH']?.report || {})}
Original Content: ${input.currentContent}

Return JSON:
{
  "modifiedContent": "full article text in markdown format",
  "stageReport": {
    "article": {
      "headline": "final headline",
      "body": "complete article body in markdown"
    },
    "wordCount": number,
    "readingTimeMinutes": number,
    "keyPoints": ["point1", "point2", "point3"],
    "sourcesCited": ["source1", "source2"],
    "writingStyle": "journalistic|analytical|feature",
    "writingNotes": "notes on writing decisions"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAgent('WRITE', prompt, 2000, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
