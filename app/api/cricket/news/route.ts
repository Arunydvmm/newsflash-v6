// @ts-nocheck
import { NextResponse } from 'next/server'

// Google News RSS — public feed, no copyright issues, links back to original sources
const RSS_URL = 'https://news.google.com/rss/search?q=cricket+IPL&hl=en-IN&gl=IN&ceid=IN:en'

let cache: { data: any; ts: number } | null = null
const TTL = 15 * 60 * 1000 // 15 min cache

function parseRSS(xml: string) {
  const items: any[] = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
  for (const match of itemMatches) {
    const item = match[1]
    const title   = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link    = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const source  = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || ''
    if (title && link) items.push({ title: title.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"'), link, pubDate, source })
  }
  return items.slice(0, 12)
}

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data, { headers: { 'X-Cache': 'HIT' } })
  }
  try {
    const res  = await fetch(RSS_URL, { headers: { 'User-Agent': 'NewsFlash/6.0' }, next: { revalidate: 900 } })
    const xml  = await res.text()
    const news = parseRSS(xml)
    cache = { data: { news }, ts: Date.now() }
    return NextResponse.json({ news }, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ news: [] }, { status: 200 })
  }
}
