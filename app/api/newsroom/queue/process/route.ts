import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { runPipeline } from '@/lib/newsroom/pipeline.service'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// Simple in-memory rate limiter
const apiCallTimestamps: number[] = []
const MAX_CALLS_PER_MINUTE = 5
const MIN_INTERVAL_MS = 60000 / MAX_CALLS_PER_MINUTE // 12 seconds between calls

function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  const now = Date.now()
  
  // Remove timestamps older than 1 minute
  const recentCalls = apiCallTimestamps.filter(timestamp => now - timestamp < 60000)
  
  if (recentCalls.length >= MAX_CALLS_PER_MINUTE) {
    const oldestCall = recentCalls[0]
    const waitTime = 60000 - (now - oldestCall)
    return { allowed: false, waitTime }
  }
  
  // Check minimum interval between calls
  if (recentCalls.length > 0) {
    const lastCall = recentCalls[recentCalls.length - 1]
    const timeSinceLastCall = now - lastCall
    if (timeSinceLastCall < MIN_INTERVAL_MS) {
      return { allowed: false, waitTime: MIN_INTERVAL_MS - timeSinceLastCall }
    }
  }
  
  return { allowed: true }
}

function recordApiCall() {
  apiCallTimestamps.push(Date.now())
}

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limit
  const rateLimit = checkRateLimit()
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
    recordApiCall()

    // Run pipeline
    const storyData = {
      headline: nextItem.headline,
      sourceUrl: nextItem.sourceUrl,
      sourceName: nextItem.sourceName,
      publishedAt: nextItem.createdAt,
      contentSnippet: ''
    }

    await runPipeline(storyData)

    // Mark as completed
    await prisma.nfWatchlist.update({
      where: { id: nextItem.id },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({ 
      message: 'Processed article successfully',
      article: nextItem.headline 
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

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}
