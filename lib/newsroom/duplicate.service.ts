import { PrismaClient } from '@prisma/client'
import { callAIProvider } from './provider.service'

const prisma = new PrismaClient()

export interface DuplicateCheckResult {
  isDuplicate: boolean
  similarArticleId?: string
}

export async function checkDuplicate(headline: string): Promise<DuplicateCheckResult> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Check for similar headlines in last 24 hours
  const recentArticles = await prisma.nfArticle.findMany({
    where: {
      createdAt: { gte: oneDayAgo },
      pipelineStatus: { in: ['DRAFT_READY', 'APPROVED', 'PUBLISHED'] }
    },
    select: { id: true, title: true }
  })

  if (recentArticles.length === 0) {
    return { isDuplicate: false }
  }

  // Use AI to check similarity
  for (const article of recentArticles) {
    const prompt = `
Compare these two headlines and determine if they are about the same story.
Headline 1: ${headline}
Headline 2: ${article.title}

Return JSON:
{
  "isSameStory": boolean,
  "similarityScore": 0.0-1.0,
  "reason": "brief reason"
}
`

    try {
      const result = await callAIProvider('MONITORING', prompt, 0.1, 300)

      if (result.data.isSameStory && result.data.similarityScore > 0.8) {
        return {
          isDuplicate: true,
          similarArticleId: article.id
        }
      }
    } catch (error) {
      console.error('Error checking headline similarity:', error)
      // Continue to next article
    }
  }

  return { isDuplicate: false }
}
