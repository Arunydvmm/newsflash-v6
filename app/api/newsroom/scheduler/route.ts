import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { fetchAllRSSFeeds } from '@/lib/newsroom/rss.service'
import { addToQueue } from '@/lib/newsroom/pipeline-engine'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-scheduler-secret')
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if engine stopped
  const config = await prisma.nfSystemConfig.findFirst()
  if (config?.engineStopped) {
    return NextResponse.json({ skipped: true, reason: 'Engine stopped by admin' })
  }

  // Check daily article limit
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const completedToday = await prisma.nfPipelineJob.count({
    where: { status: 'COMPLETED', completedAt: { gte: todayStart } }
  })
  if (completedToday >= 5) {
    return NextResponse.json({ skipped: true, reason: `Daily limit reached (${completedToday}/5). Resets midnight IST.` })
  }

  const slotsRemaining = 5 - completedToday

  // Fetch all RSS articles
  const allArticles = await fetchAllRSSFeeds()

  // Score each article — higher = more important
  function scoreArticle(item: any): number {
    let score = 0
    const h = item.headline.toLowerCase()
    const ageHours = (Date.now() - new Date(item.publishedAt).getTime()) / 3600000

    // Recency — fresher = higher score
    score += Math.max(0, 10 - ageHours)

    // Source weight
    score += item.sourceWeight ?? 5

    // Breaking news signals
    if (['breaking', 'urgent', 'live', 'just in', 'exclusive', 'alert'].some(k => h.includes(k))) score += 5

    // India-specific topics
    if (['modi', 'bjp', 'congress', 'supreme court', 'rbi', 'sebi', 'budget', 'election'].some(k => h.includes(k))) score += 3

    // Content length (more content = more processable)
    score += Math.min(3, (item.contentSnippet?.length ?? 0) / 200)

    return score
  }

  // Deduplicate + score + pick top N needed
  const seen = new Set<string>()
  const scored = allArticles
    .filter(item => {
      const key = item.headline.toLowerCase().slice(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(item => ({ ...item, score: scoreArticle(item) }))
    .sort((a, b) => b.score - a.score)

  // Check duplicates against DB
  let added = 0
  for (const item of scored) {
    if (added >= slotsRemaining) break

    const isDuplicate = await prisma.nfWatchlist.findFirst({
      where: { headline: { contains: item.headline.slice(0, 40) } }
    })
    if (isDuplicate) continue

    const watchlistItem = await prisma.nfWatchlist.create({
      data: {
        headline:       item.headline,
        sourceUrl:      item.sourceUrl,
        sourceName:     item.sourceName,
        contentSnippet: item.contentSnippet ?? '',
        category:       item.category ?? 'General'
      }
    })

    await addToQueue(watchlistItem.id)
    added++
  }

  // Start engine to process queue (1 at a time)
  if (added > 0) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/newsroom/engine/start`, {
      method: 'POST',
      headers: { 'x-scheduler-secret': process.env.SCHEDULER_SECRET! }
    })
  }

  return NextResponse.json({
    added,
    completedToday,
    remaining: slotsRemaining - added,
    message: `${added} articles queued. ${completedToday}/5 completed today.` 
  })
}
