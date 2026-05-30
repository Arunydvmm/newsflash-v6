import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check for duplicates
    const existing = await prisma.nfArticle.findFirst({
      where: { sourceUrl: url }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Article already exists in database' }, { status: 409 })
    }

    const existingWatchlist = await prisma.nfWatchlist.findFirst({
      where: { sourceUrl: url }
    })
    
    if (existingWatchlist) {
      return NextResponse.json({ error: 'Article already in watchlist' }, { status: 409 })
    }

    // Add to watchlist
    const watchlistItem = await prisma.nfWatchlist.create({
      data: {
        headline: `Custom URL: ${url}`,
        sourceUrl: url,
        sourceName: 'Custom URL',
        region: 'India',
        priority: 'STANDARD',
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      headline: watchlistItem.headline,
      id: watchlistItem.id
    })
  } catch (error) {
    console.error('Error fetching from URL:', error)
    return NextResponse.json({ error: 'Failed to add URL to watchlist' }, { status: 500 })
  }
}
