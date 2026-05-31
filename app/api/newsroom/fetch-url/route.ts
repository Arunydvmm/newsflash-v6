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
      where: { sourceUrl: url },
      select: { id: true }
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

    // Fetch real page title and content snippet
    let headline = url
    let contentSnippet = ''
    try {
      const pageRes = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000)
      })
      const html = await pageRes.text()
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      headline = titleMatch ? titleMatch[1].trim() : url
      contentSnippet = descMatch ? descMatch[1].trim() : ''
    } catch (e) {
      console.warn('Could not fetch page title, using URL as headline')
    }

    // Add to watchlist
    const watchlistItem = await prisma.nfWatchlist.create({
      data: {
        headline,
        sourceUrl: url,
        sourceName: 'Custom URL',
        region: 'India',
        priority: 'STANDARD',
        status: 'PENDING',
        contentSnippet
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
