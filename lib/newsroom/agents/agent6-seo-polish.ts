import { callAgent } from '../agent-caller'

interface AgentInput {
  jobId: string
  currentContent: string
  allPreviousReports: Record<string, any>
  sourceData: any
  metadata: { title: string; region: string; priority: string }
}

export async function seoPolishAgent(input: AgentInput) {
  const startTime = Date.now()

  const prompt = `
You are an SEO and content polishing AI. Optimize this article for search engines and readability.

SEO optimization tasks:
1. Create SEO-friendly headline (under 60 characters, includes primary keyword)
2. Generate meta description (150-160 characters, compelling, includes keywords)
3. Generate URL slug (hyphenated, lowercase, includes main topic)
4. Identify and add relevant keywords naturally
5. Optimize heading structure (H1, H2, H3 hierarchy)
6. Add internal linking suggestions
7. Suggest relevant tags/categories

Content polishing tasks:
1. Improve readability (short paragraphs, clear sentences)
2. Fix grammar and spelling issues
3. Enhance flow and transitions
4. Remove redundancy
5. Add bullet points for lists where appropriate
6. Ensure consistent tone and style
7. Add subheadings for long sections

Article Content: ${input.currentContent}
Category: ${input.sourceData?.category || 'General'}
Region: ${input.metadata.region}

Return JSON:
{
  "modifiedContent": "polished article in markdown format",
  "stageReport": {
    "seo": {
      "headline": "SEO-optimized headline (under 60 chars)",
      "metaTitle": "meta title for search engines",
      "metaDescription": "compelling meta description (150-160 chars)",
      "slug": "url-slug-for-article",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "primaryKeyword": "main keyword"
    },
    "polish": {
      "polishedBody": "fully polished article content",
      "readabilityScore": 0.0-1.0,
      "grammarFixes": ["fix1", "fix2"],
      "styleImprovements": ["improvement1", "improvement2"],
      "wordCount": number,
      "sentenceCount": number,
      "avgSentenceLength": number
    },
    "structure": {
      "headings": ["H1: title", "H2: section1", "H3: subsection"],
      "bulletPointsAdded": boolean,
      "subheadingsAdded": boolean
    },
    "tags": ["tag1", "tag2", "tag3"],
    "polishNotes": "notes on changes made"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAgent('SEO_POLISH', prompt, 1500, input.jobId)
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
