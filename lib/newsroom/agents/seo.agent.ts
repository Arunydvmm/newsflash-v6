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

export async function seoAgent(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now()

  const prompt = `
You are an SEO optimization AI. Optimize this article for search engines.

EXPLICIT INSTRUCTION:
- Meta title must be under 60 characters
- Meta description must be under 160 characters
- Generate URL slug from headline (lowercase, hyphens, no special chars)
- Identify primary keyword and ensure it appears in first paragraph
- Optimize heading structure (H1, H2, H3)

SEO requirements:
1. Meta title: Under 60 chars, includes primary keyword, compelling
2. Meta description: Under 160 chars, summarizes article, includes keywords
3. URL slug: SEO-friendly, based on headline, lowercase with hyphens
4. Primary keyword: Main search term, appears in title, first paragraph, and headings
5. Heading structure: One H1 (headline), multiple H2s for sections, H3s for subsections
6. Readability: Short sentences, short paragraphs, bullet points where appropriate
7. Internal linking opportunities: Link to related articles if applicable

Title: ${input.metadata.title}
Content: ${input.currentContent}
Copyright Report: ${JSON.stringify(input.previousStageReport)}

Return JSON:
{
  "modifiedContent": "SEO-optimized content",
  "stageReport": {
    "metaTitle": "optimized title (under 60 chars)",
    "metaTitleLength": number,
    "metaDescription": "optimized description (under 160 chars)",
    "metaDescriptionLength": number,
    "urlSlug": "seo-friendly-slug",
    "primaryKeyword": "main keyword",
    "keywordInFirstParagraph": boolean,
    "headingStructure": {
      "h1": "headline",
      "h2Count": number,
      "h3Count": number
    },
    "keywords": ["keyword1", "keyword2"],
    "readabilityScore": 0.0-1.0,
    "seoScore": 0.0-1.0,
    "seoNotes": "notes"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|ESCALATE|REWRITE|BLOCK"
}
`

  const result = await callAIProvider('SEO_REVIEW', prompt, 0.3, 2000)
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
