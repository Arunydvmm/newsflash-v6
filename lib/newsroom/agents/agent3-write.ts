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

  const schema = input.allPreviousReports['EXTRACT']?.report?.schema || {}
  const sourceHeadline = input.metadata.title
  const sourceSnippet = input.currentContent?.slice(0, 500) || ''

  const prompt = `
You are a senior news writer. Write a publication-ready news article from this verified schema and source info.

Schema: ${JSON.stringify(schema)}
Source headline: "${sourceHeadline}"
Source snippet: "${sourceSnippet}"

REQUIREMENTS:
- Length: minimum 500 words (quality over length)
- Structure: inverted pyramid - most important info first
- Lead paragraph should hook the reader
- Short paragraphs: max 3 sentences (mobile-first)
- Subheadings (##) every 3-4 paragraphs
- Active voice throughout
- India-appropriate tone
- If schema is empty, use source headline and snippet to write an informative article

REQUIREMENTS FOR JSON:
- headline: max 80 chars
- subheadline: max 150 chars
- body: full markdown article (500+ words)
- metaTitle: under 60 chars for SEO
- metaDescription: under 160 chars for SEO
- tags: array of relevant tags
- slug: url-friendly slug

Return ONLY valid JSON with no markdown markers:
{
  "article": {
    "headline": "headline",
    "subheadline": "subheadline", 
    "body": "full article body in markdown with subheadings",
    "metaTitle": "seo title",
    "metaDescription": "seo description",
    "tags": ["tag1", "tag2"],
    "slug": "article-slug"
  },
  "wordCount": 0,
  "tablesIncluded": 0,
  "confidence": 0.8
}

CRITICAL: Return valid JSON ONLY. No markdown code blocks.
`

  const result = await callAgent('WRITE', prompt, 3000, input.jobId)
  const processingMs = Date.now() - startTime

  // Fallback article if generation fails
  const fallbackArticle = {
    headline: sourceHeadline.slice(0, 80),
    subheadline: sourceSnippet.slice(0, 150),
    body: `# ${sourceHeadline}\n\n${sourceSnippet}\n\nThis article was generated with limited information. Please review and enhance as needed.`,
    metaTitle: sourceHeadline.slice(0, 60),
    metaDescription: sourceSnippet.slice(0, 160),
    tags: ['India', 'News'],
    slug: sourceHeadline.toLowerCase().replace(/\s+/g, '-').slice(0, 60)
  }

  // Try to extract article from result
  const article = result.data?.article || result.data?.article || fallbackArticle

  return {
    modifiedContent: input.currentContent,
    stageReport: {
      article,
      wordCount: result.data?.wordCount ?? article.body.split(/\s+/).length,
      tablesIncluded: result.data?.tablesIncluded ?? 0,
      ...result.data
    },
    confidence: result.data?.confidence ?? 0.7,
    recommendation: 'PROCEED',
    blockReason: result.data?.blockReason,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    usedKey: result.usedKey,
    tokensUsed: result.tokensUsed,
    processingMs,
    sleepOccurred: result.sleepOccurred,
    sleepDurationMs: result.sleepDurationMs
  }
}
