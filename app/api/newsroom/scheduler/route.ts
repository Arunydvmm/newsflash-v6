import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { addToQueue } from '@/lib/newsroom/pipeline-engine'

const prisma = new PrismaClient()

const RSS_SOURCES = [
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-india-news' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/india/feed/' },
  { name: 'BBC News India', url: 'http://feeds.bbci.co.uk/news/world/south_asia/rss.xml' },
  { name: 'Reuters India', url: 'https://www.reuters.com/rssFeed/rssNews?section=india' },
  { name: 'News18', url: 'https://www.news18.com/rss/india.xml' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news.xml' }
]

export async function POST(req: NextRequest) {
  const schedulerSecret = req.headers.get('x-scheduler-secret')
  if (schedulerSecret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if engine is stopped
    const config = await prisma.nfSystemConfig.findFirst()
    if (config?.engineStopped) {
      return NextResponse.json({ 
        message: 'Engine is stopped. Skipping scheduler run.',
        added: 0,
        skipped: 0,
        slotsActivated: 0,
        timestamp: new Date().toISOString()
      })
    }

    // Fetch RSS feeds
    const allArticles: any[] = []
    for (const source of RSS_SOURCES) {
      try {
        const response = await fetch(source.url, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) continue
        const text = await response.text()
        
        // Simple RSS parsing (in production, use a proper RSS parser)
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []
        for (const item of items) {
          const titleMatch = item.match(/<title>(.*?)<\/title>/)
          const linkMatch = item.match(/<link>(.*?)<\/link>/) || item.match(/<link[^>]*>(.*?)<\/link>/)
          const descMatch = item.match(/<description>(.*?)<\/description>/)
          
          if (titleMatch && linkMatch) {
            allArticles.push({
              headline: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ''),
              sourceUrl: linkMatch[1].trim(),
              sourceName: source.name,
              contentSnippet: descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').slice(0, 500) : '',
              region: 'India',
              priority: 'STANDARD'
            })
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${source.name}:`, err)
      }
    }

    // Deduplicate by URL
    const seenUrls = new Set()
    const uniqueArticles = allArticles.filter(article => {
      if (seenUrls.has(article.sourceUrl)) return false
      seenUrls.add(article.sourceUrl)
      return true
    })

    // Score and take top 10
    const scoredArticles = uniqueArticles
      .map(article => ({
        ...article,
        score: Math.random() * 100 // Simple random scoring for now
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Check for existing watchlist items to avoid duplicates
    const existingUrls = new Set(
      (await prisma.nfWatchlist.findMany({ select: { sourceUrl: true } }))
        .map(w => w.sourceUrl)
    )

    let added = 0
    let skipped = 0

    for (const article of scoredArticles) {
      if (existingUrls.has(article.sourceUrl)) {
        skipped++
        continue
      }

      const watchlist = await prisma.nfWatchlist.create({
        data: {
          headline: article.headline,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          contentSnippet: article.contentSnippet,
          region: article.region,
          priority: article.priority,
          status: 'PENDING'
        }
      })

      await addToQueue(watchlist.id)
      added++
    }

    // Trigger engine start
    const engineResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/newsroom/engine/start`, {
      method: 'POST',
      headers: { 'x-scheduler-secret': process.env.SCHEDULER_SECRET || '' }
    })
    const engineData = await engineResponse.json()

    return NextResponse.json({
      added,
      skipped,
      slotsActivated: engineData.activated || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Scheduler error:', error)
    return NextResponse.json({ error: 'Failed to run scheduler' }, { status: 500 })
  }
}
