// @ts-nocheck
// Sarkari Result RapidAPI — backend proxy
// Host: sarkari-result.p.rapidapi.com
// API key NEVER sent to frontend
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'sarkari-result.p.rapidapi.com'
const CACHE_TTL     = 30 * 60 * 1000 // 30 minutes

let cache: Record<string, { data: any; ts: number }> = {}

async function fetchSarkari(endpoint: string, apiKey: string) {
  const cacheKey = endpoint
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return { data: cache[cacheKey].data, fromCache: true }
  }

  const res = await fetch(`https://${RAPIDAPI_HOST}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': apiKey,
    },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  cache[cacheKey] = { data, ts: Date.now() }
  return { data, fromCache: false }
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'results'

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    return NextResponse.json({ error: 'RAPIDAPI_KEY not configured', data: [] }, { status: 503 })
  }

  try {
    let endpoint = ''
    switch (type) {
      case 'jobs':        endpoint = '/jobs/';        break
      case 'admit-card':  endpoint = '/admit-card/';  break
      case 'answer-key':  endpoint = '/answer-key/';  break
      case 'results':
      default:            endpoint = '/results/';     break
    }

    const { data, fromCache } = await fetchSarkari(endpoint, API_KEY)

    // Normalize to a consistent shape
    const items = normalizeItems(data, type)

    return NextResponse.json(
      { items, total: items.length, type },
      { headers: { 'X-Cache': fromCache ? 'HIT' : 'MISS', 'Cache-Control': 'public, max-age=1800' } }
    )
  } catch (err: any) {
    console.error('Sarkari Result API error:', err.message)
    // Return stale cache if available
    const cacheKey = `/${type}/`
    if (cache[cacheKey]) {
      const items = normalizeItems(cache[cacheKey].data, type)
      return NextResponse.json({ items, total: items.length, type, stale: true }, { headers: { 'X-Cache': 'STALE' } })
    }
    return NextResponse.json({ error: err.message, items: [], total: 0 }, { status: 502 })
  }
}

function normalizeItems(data: any, type: string): any[] {
  // Handle both array and object responses
  const raw = Array.isArray(data) ? data : (data?.data || data?.results || data?.jobs || data?.items || [])

  return raw.map((item: any) => ({
    id:       item.id    || item._id    || Math.random().toString(36).slice(2),
    title:    item.title || item.name   || item.post || item.exam || '',
    org:      item.organization || item.org || item.department || item.board || '',
    date:     item.date  || item.lastDate || item.resultDate || item.examDate || item.publishDate || '',
    link:     item.link  || item.url    || item.applyLink || item.officialLink || '',
    category: item.category || item.type || type,
    status:   item.status   || item.state || '',
    extra:    item.totalPost || item.vacancy || item.posts || '',
  })).filter((i: any) => i.title)
}
