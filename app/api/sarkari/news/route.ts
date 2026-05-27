// @ts-nocheck
// Sarkari Naukri news feed — Google News RSS (free, no API key needed)
// Links back to original sources (SarkariResult, NaukariTime, etc.)
import { NextResponse } from 'next/server'

const RSS_FEEDS = [
  'https://news.google.com/rss/search?q=sarkari+naukri+2026&hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/search?q=government+jobs+recruitment+2026+India&hl=en-IN&gl=IN&ceid=IN:en',
]

let cache: { data: any; ts: number } | null = null
const TTL = 15 * 60 * 1000 // 15 min

function parseRSS(xml: string) {
  const items: any[] = []
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of matches) {
    const item    = match[1]
    const title   = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link    = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const source  = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || ''
    if (title && link) {
      items.push({
        title: title
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        link, pubDate, source,
      })
    }
  }
  return items
}

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } })
  }

  try {
    // Fetch both feeds in parallel
    const results = await Promise.allSettled(
      RSS_FEEDS.map(url =>
        fetch(url, { headers: { 'User-Agent': 'NewsFlash/6.0' }, next: { revalidate: 900 } })
          .then(r => r.text())
          .then(parseRSS)
      )
    )

    // Merge and deduplicate by title
    const allItems: any[] = []
    const seen = new Set<string>()
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          const key = item.title.slice(0, 60)
          if (!seen.has(key)) { seen.add(key); allItems.push(item) }
        }
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
      return db - da
    })

    const news = allItems.slice(0, 16)
    cache = { data: { news }, ts: Date.now() }
    return NextResponse.json({ news }, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ news: [] })
  }
}
