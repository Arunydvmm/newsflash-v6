// @ts-nocheck
// Cricket matches — uses Google News RSS (free, always works)
// Live scores widget uses news headlines from Google News cricket feed
import { NextRequest, NextResponse } from 'next/server'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
let cache: { data: any; ts: number } | null = null

// Also try free-cricbuzz match-info if a matchid is provided
const RAPIDAPI_HOST = 'free-cricbuzz-cricket-api.p.rapidapi.com'

function parseRSS(xml: string) {
  const items: any[] = []
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of matches) {
    const item    = match[1]
    const title   = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link    = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const source  = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || ''
    if (title && link) items.push({
      title: title.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"'),
      link, pubDate, source,
    })
  }
  return items.slice(0, 20)
}

export async function GET(req: NextRequest) {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } })
  }

  try {
    // Fetch live cricket scores from Google News RSS
    const rssUrl = 'https://news.google.com/rss/search?q=cricket+live+score+today&hl=en-IN&gl=IN&ceid=IN:en'
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'NewsFlash/6.0' },
      next: { revalidate: 600 },
    })
    const xml  = await res.text()
    const news = parseRSS(xml)

    // Return as "matches" format so cricket page can display them
    const data = { data: [], news, source: 'rss' }
    cache = { data, ts: Date.now() }
    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ data: [], news: [], error: err.message })
  }
}
