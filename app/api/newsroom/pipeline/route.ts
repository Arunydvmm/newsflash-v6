import { NextRequest, NextResponse } from 'next/server'
import { fetchRSSFeeds } from '@/lib/newsroom/rss.service'
import { checkDuplicate } from '@/lib/newsroom/duplicate.service'
import { runPipeline } from '@/lib/newsroom/pipeline.service'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-scheduler-secret')
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch RSS feeds
    const feeds = await fetchRSSFeeds()

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
      runPipeline(story).catch(console.error)
      triggered.push(story.headline)
    }

    return NextResponse.json({ triggered: triggered.length, articles: triggered })
  } catch (error) {
    console.error('Pipeline trigger error:', error)
    return NextResponse.json({ error: 'Failed to trigger pipeline' }, { status: 500 })
  }
}
