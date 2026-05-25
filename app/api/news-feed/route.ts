// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

// Google News RSS feeds — public, no copyright issues
const FEEDS: Record<string, string> = {
  education: 'https://news.google.com/rss/search?q=education+exam+India+CBSE+NEET+JEE+UPSC&hl=en-IN&gl=IN&ceid=IN:en',
  sarkari:   'https://news.google.com/rss/search?q=sarkari+naukri+government+job+recruitment+India&hl=en-IN&gl=IN&ceid=IN:en',
  india:     'https://news.google.com/rss/search?q=India+news+today&hl=en-IN&gl=IN&ceid=IN:en',
  business:  'https://news.google.com/rss/search?q=India+business+economy+finance&hl=en-IN&gl=IN&ceid=IN:en',
  technology:'https://news.google.com/rss/search?q=technology+AI+India+tech+news&hl=en-IN&gl=IN&ceid=IN:en',
  cricket:   'https://news.google.com/rss/search?q=cricket+IPL+India&hl=en-IN&gl=IN&ceid=IN:en',
}

const cache: Record<string, { data: any; ts: number }> = {}
const TTL = 15 * 60 * 1000 // 15 min

function parseRSS(xml: string, limit = 10) {
  const items: any[] = []
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const m of matches) {
    const item    = m[1]
    const title   = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim()
    const link    = item.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() || ''
    const source  = (item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '').replace(/&amp;/g,'&').trim()
    if (title && link) items.push({ title, link, pubDate, source })
    if (items.length >= limit) break
  }
  return items
}

export async function GET(req: NextRequest) {
  const topic = (req.nextUrl.searchParams.get('topic') || 'education') as string
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')
  const feedUrl = FEEDS[topic] || FEEDS.education

  const key = `${topic}_${limit}`
  if (cache[key] && Date.now() - cache[key].ts < TTL) {
    return NextResponse.json(cache[key].data, { headers: { 'X-Cache': 'HIT' } })
  }

  try {
    const res  = await fetch(feedUrl, { headers: { 'User-Agent': 'NewsFlash/6.0 RSS Reader' }, next: { revalidate: 900 } })
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`)
    const xml  = await res.text()
    const news = parseRSS(xml, limit)
    const data = { news, topic, updatedAt: new Date().toISOString() }
    cache[key] = { data, ts: Date.now() }
    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    if (cache[key]) return NextResponse.json(cache[key].data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ news: [], topic }, { status: 200 })
  }
}
