// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import { fetchRSSFeeds } from '@/lib/newsroom/rss'
import { runPipeline } from '@/lib/newsroom/pipeline'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.AI_NEWSROOM_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const feeds = await fetchRSSFeeds()
  const top5 = feeds.slice(0, 5)
  const triggered = []

  for (const item of top5) {
    const exists = await NfArticle.findOne({
      title: { $regex: item.title.slice(0, 30), $options: 'i' }
    })
    if (exists) continue

    const article = await NfArticle.create({
      title: item.title,
      content: item.contentSnippet,
      sourceUrl: item.link,
      sourceName: item.source,
      region: item.region,
      pipelineStatus: 'MONITORING'
    })

    // Run pipeline in background (don't await)
    runPipeline(article._id.toString()).catch(console.error)
    triggered.push(item.title)
  }

  return NextResponse.json({ triggered: triggered.length, articles: triggered })
}