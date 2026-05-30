import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { runPipeline } from '@/lib/newsroom/pipeline.service'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
