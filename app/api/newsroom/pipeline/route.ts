import { NextRequest, NextResponse } from 'next/server'
import { fetchRSSFeeds } from '@/lib/newsroom/rss.service'
import { checkDuplicate } from '@/lib/newsroom/duplicate.service'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch RSS feeds
    const feeds = await fetchRSSFeeds()
    console.log(`Fetched ${feeds.length} articles from RSS feeds`)

    if (feeds.length === 0) {
      return NextResponse.json({ triggered: 0, articles: [], message: 'No articles fetched from RSS feeds' })
    }

    // Score each article and pick top 5
    const scored = feeds.map(item => {
      let score = 0
      const h = item.headline.toLowerCase()
      // Recency bonus
      const ageHours = (Date.now() - item.publishedAt.getTime()) / 3600000
      score += Math.max(0, 10 - ageHours) // fresher = higher score
      // Breaking news keywords
      const breaking = ['breaking', 'urgent', 'alert', 'just in', 'live', 'exclusive']
      if (breaking.some(k => h.includes(k))) score += 5
      // India-specific bonus
      if (item.sourceName.includes('NDTV') || item.sourceName.includes('Hindu') || item.sourceName.includes('Times of India')) score += 2
      // Content length bonus (more content = more processable)
      score += Math.min(3, item.contentSnippet.length / 100)
      return { ...item, score }
    }).sort((a, b) => b.score - a.score)

    const top5 = scored.slice(0, 5)

    const addedToWatchlist = []

    for (const story of top5) {
      // Check for duplicates in watchlist and articles
      const duplicateCheck = await checkDuplicate(story.headline)
      const watchlistDuplicate = await prisma.nfWatchlist.findFirst({
        where: { headline: story.headline, status: { in: ['PENDING', 'PROCESSING'] } }
      })

      if (duplicateCheck.isDuplicate || watchlistDuplicate) {
        console.log(`Skipping duplicate: ${story.headline}`)
        continue
      }

      // Add to watchlist instead of running immediately
      await prisma.nfWatchlist.create({
        data: {
          headline: story.headline,
          sourceUrl: story.sourceUrl,
          sourceName: story.sourceName,
          region: 'India',
          priority: 'STANDARD',
          status: 'PENDING'
        }
      })
      addedToWatchlist.push(story.headline)
    }

    console.log(`Added ${addedToWatchlist.length} articles to watchlist`)
    return NextResponse.json({ added: addedToWatchlist.length, articles: addedToWatchlist, message: 'Articles added to watchlist for sequential processing' })
  } catch (error) {
    console.error('Pipeline trigger error:', error)
    return NextResponse.json({ error: 'Failed to add articles to watchlist', details: String(error) }, { status: 500 })
  }
}
