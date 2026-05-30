import { NextRequest, NextResponse } from 'next/server'
import { fetchRSSFeeds } from '@/lib/newsroom/rss.service'
import { checkDuplicate } from '@/lib/newsroom/duplicate.service'
import { runPipeline } from '@/lib/newsroom/pipeline.service'
import { getAuth } from '@/lib/auth'

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

    // Pick top 5 by newsworthiness (simplified - just take first 5)
    const top5 = feeds.slice(0, 5)

    const triggered = []

    for (const story of top5) {
      // Check for duplicates
      const duplicateCheck = await checkDuplicate(story.headline)
      if (duplicateCheck.isDuplicate) {
        console.log(`Skipping duplicate: ${story.headline}`)
        continue
      }

      // Run pipeline (don't await - run in background)
      runPipeline(story).catch(error => console.error('Pipeline error for story:', story.headline, error))
      triggered.push(story.headline)
    }

    console.log(`Triggered ${triggered.length} articles for processing`)
    return NextResponse.json({ triggered: triggered.length, articles: triggered })
  } catch (error) {
    console.error('Pipeline trigger error:', error)
    return NextResponse.json({ error: 'Failed to trigger pipeline', details: String(error) }, { status: 500 })
  }
}
