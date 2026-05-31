import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { runPipeline } from '@/lib/newsroom/pipeline.service'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

async function checkRateLimit(): Promise<{ allowed: boolean; waitTime?: number }> {
  const config = await prisma.nfSystemConfig.findFirst()
  const now = Date.now()
  const timestamps: number[] = config?.rateLimitTimestamps ? JSON.parse(config.rateLimitTimestamps as string) : []
  const recent = timestamps.filter(t => now - t < 60000)
  if (recent.length >= 5) {
    return { allowed: false, waitTime: 60000 - (now - recent[0]) }
  }
  if (recent.length > 0 && now - recent[recent.length - 1] < 12000) {
    return { allowed: false, waitTime: 12000 - (now - recent[recent.length - 1]) }
  }
  return { allowed: true }
}

async function recordApiCall() {
  const config = await prisma.nfSystemConfig.findFirst()
  const now = Date.now()
  const timestamps: number[] = config?.rateLimitTimestamps ? JSON.parse(config.rateLimitTimestamps as string) : []
  const recent = timestamps.filter(t => now - t < 60000)
  recent.push(now)
  await prisma.nfSystemConfig.upsert({
    where: { id: config?.id || 'default' },
    update: { rateLimitTimestamps: JSON.stringify(recent) },
    create: { id: 'default', rateLimitTimestamps: JSON.stringify(recent) }
  })
}

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit
  const rateLimit = await checkRateLimit()
  if (!rateLimit.allowed) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded',
      waitTime: Math.ceil((rateLimit.waitTime || 0) / 1000),
      message: `Please wait ${Math.ceil((rateLimit.waitTime || 0) / 1000)} seconds before processing next article`
    }, { status: 429 })
  }

  try {
    // Get next pending item from watchlist
    const nextItem = await prisma.nfWatchlist.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    })

    if (!nextItem) {
      return NextResponse.json({ message: 'No pending items in watchlist' })
    }

    // Mark as processing
    await prisma.nfWatchlist.update({
      where: { id: nextItem.id },
      data: { status: 'PROCESSING' }
    })

    // Record API call before running pipeline
    await recordApiCall()

    // Fetch real content snippet from sourceUrl if not already present
    let contentSnippet = nextItem.contentSnippet || ''
    if (!contentSnippet && nextItem.sourceUrl) {
      try {
        const res = await fetch(nextItem.sourceUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(8000)
        })
        const html = await res.text()
        // Strip tags, get first 500 chars of body text
        const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        contentSnippet = text.substring(0, 500)
      } catch (e) {
        console.warn('Could not fetch content snippet for:', nextItem.sourceUrl)
      }
    }

    // Run pipeline
    const storyData = {
      headline: nextItem.headline,
      sourceUrl: nextItem.sourceUrl,
      sourceName: nextItem.sourceName,
      publishedAt: nextItem.createdAt,
      contentSnippet
    }

    await runPipeline(storyData)

    // Find the created article
    const article = await prisma.nfArticle.findFirst({
      where: {
        title: nextItem.headline,
        sourceName: nextItem.sourceName,
        createdAt: { gte: new Date(Date.now() - 60000) } // Created in last minute
      },
      orderBy: { createdAt: 'desc' }
    })

    // Mark as completed with article ID
    await prisma.nfWatchlist.update({
      where: { id: nextItem.id },
      data: { 
        status: 'COMPLETED',
        articleId: article?.id || null
      }
    })

    return NextResponse.json({ 
      message: 'Processed article successfully',
      article: nextItem.headline,
      articleId: article?.id
    })
  } catch (error) {
    console.error('Queue processing error:', error)
    
    // Mark as failed if error occurred
    const nextItem = await prisma.nfWatchlist.findFirst({
      where: { status: 'PROCESSING' },
      orderBy: { createdAt: 'asc' }
    })

    if (nextItem) {
      await prisma.nfWatchlist.update({
        where: { id: nextItem.id },
        data: { 
          status: 'FAILED',
          errorMessage: String(error)
        }
      })
    }

    return NextResponse.json({ error: 'Failed to process article', details: String(error) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const watchlist = await prisma.nfWatchlist.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    console.log(`Watchlist API: Returning ${watchlist.length} items`)
    return NextResponse.json({ watchlist, count: watchlist.length })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}
