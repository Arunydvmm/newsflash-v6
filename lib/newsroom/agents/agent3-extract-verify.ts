import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function extractVerifyAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are a content extraction AI. Extract key information from this article.

ENFORCE STRICT SCHEMA OUTPUT:
- ALL required fields must be present in the output
- If any required field is missing or cannot be extracted, return recommendation: "BLOCK" with specific missing field name
- Do not make up or hallucinate values for missing fields
- Use only information present in the source content

Required fields (ALL must be present):
- headline: The main headline/title of the article
- category: News category (India|World|Business|Technology|Sports|Science|Health|Entertainment|Opinion|Cricket|Sarkari|Education)
- organization: Organizations, companies, government bodies mentioned
- keyPeople: Key individuals, officials, personalities mentioned
- dates: All dates mentioned (events, deadlines, announcements)
- locations: Geographic locations, cities, states, venues
- statistics: Numbers, percentages, figures, data points
- officialSources: Official statements, press releases, government announcements
- summary: Brief summary of the article (2-3 sentences)

Title: ${input.metadata.title}
Content: ${input.currentContent}
Research Report: ${JSON.stringify(input.allPreviousReports['RESEARCH']?.report || {})}

Return JSON:
{
  "modifiedContent": "structured article content",
  "stageReport": {
    "headline": "extracted headline (REQUIRED)",
    "category": "category (REQUIRED)",
    "organization": ["org1", "org2"] (REQUIRED),
    "keyPeople": ["person1", "person2"] (REQUIRED),
    "dates": ["date1", "date2"] (REQUIRED),
    "locations": ["location1", "location2"] (REQUIRED),
    "statistics": ["stat1", "stat2"] (REQUIRED),
    "officialSources": ["source1", "source2"] (REQUIRED),
    "summary": "summary (REQUIRED)",
    "missingFields": ["field1", "field2"] if any required fields are missing,
    "extractionQuality": 0.0-1.0,
    "extractionNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}

If any required field is missing, set recommendation to "BLOCK" and list missing fields in missingFields array.
`

  const result = await callAgent('EXTRACT_VERIFY', prompt, 800, input.jobId)
  const processingMs = Date.now() - startTime

  return {
    modifiedContent: result.data.modifiedContent || input.currentContent,
    stageReport: result.data.stageReport,
    confidence: result.data.confidence || 0.8,
    recommendation: result.data.recommendation || 'PROCEED',
    blockReason: result.data.recommendation === 'BLOCK' ? result.data.stageReport?.missingFields?.join(', ') : undefined,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
