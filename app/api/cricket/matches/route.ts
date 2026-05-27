// @ts-nocheck
// LiveScore6 RapidAPI — cricket matches backend proxy
// API key NEVER sent to frontend
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'livescore6.p.rapidapi.com'
const CACHE_TTL     = 15 * 60 * 1000 // 15 minutes

let cache: { data: any; ts: number } | null = null

// Returns today's date in YYYYMMDD format (IST)
function getTodayDate(): string {
  const now = new Date()
  // IST = UTC+5:30
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
  const y = ist.getUTCFullYear()
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const d = String(ist.getUTCDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

// Cricket-related keywords to validate stages/competitions
const CRICKET_KEYWORDS = [
  'cricket', 'ipl', 'test', 't20', 'odi', 'bbl', 'psl', 'cpl', 'sa20',
  'wpl', 'icc', 'ranji', 'duleep', 'vijay', 'syed mushtaq', 'nca',
  'india', 'england', 'australia', 'pakistan', 'sri lanka', 'bangladesh',
  'new zealand', 'south africa', 'west indies', 'zimbabwe', 'afghanistan',
]

function isCricketStage(stage: any): boolean {
  const name = (stage?.Cnm || stage?.Snm || '').toLowerCase()
  if (!name) return false
  return CRICKET_KEYWORDS.some(kw => name.includes(kw))
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'matches'

  // Serve from cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    })
  }

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: 'RAPIDAPI_KEY not configured', data: [] }, { status: 503 })
  }

  try {
    let url = ''
    switch (type) {
      case 'news':
        url = `https://${RAPIDAPI_HOST}/news/list?category=cricket`
        break
      case 'matches':
      case 'currentMatches':
      default:
        // Use list-by-date for today's cricket matches (more reliable than list-live)
        url = `https://${RAPIDAPI_HOST}/matches/v2/list-by-date?category=cricket&timezone=5.5&date=${getTodayDate()}`
        break
    }

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('LiveScore6 API error:', res.status, await res.text())
      if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
      return NextResponse.json({ error: `API error: ${res.status}`, data: [] }, { status: 502 })
    }

    const raw = await res.json()
    const normalized = normalizeLiveScore6(raw, type)
    cache = { data: normalized, ts: Date.now() }

    return NextResponse.json(normalized, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
    })
  } catch (err: any) {
    console.error('Cricket API error:', err.message)
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: err.message, data: [] }, { status: 502 })
  }
}

function normalizeLiveScore6(raw: any, type: string) {
  if (type === 'news') {
    const articles = raw?.Stages || raw?.articles || raw?.data || []
    return {
      data: articles.map((a: any) => ({
        id:           a.Eid || a.id || Math.random().toString(36),
        name:         a.Snm || a.title || '',
        status:       a.Eps || a.status || '',
        matchStarted: true,
        matchEnded:   false,
        teams:        [],
        score:        [],
        venue:        '',
        isNews:       true,
        link:         a.Url || a.url || '',
      })),
    }
  }

  // Match list — LiveScore6 uses Stages > Events structure
  // Filter stages to only include cricket competitions
  const stages = (raw?.Stages || []).filter(isCricketStage)
  const matches: any[] = []

  for (const stage of stages) {
    const events = stage?.Events || []
    for (const ev of events) {
      const t1 = ev?.T1?.[0] || {}
      const t2 = ev?.T2?.[0] || {}
      const isLive      = ev?.Eps === 'Live' || ev?.Eps === 'HT' || ev?.Eps === 'In Progress'
      const isCompleted = ev?.Eps === 'Fin'  || ev?.Eps === 'FT' || ev?.Eps === 'Ended'
      const isUpcoming  = !isLive && !isCompleted

      matches.push({
        id:           ev?.Eid || ev?.id,
        name:         `${t1?.Nm || 'Team 1'} vs ${t2?.Nm || 'Team 2'}`,
        status:       isLive ? 'Live' : isCompleted ? 'Completed' : ev?.Eps || 'Upcoming',
        matchStarted: isLive || isCompleted,
        matchEnded:   isCompleted,
        teams:        [t1?.Nm || 'Team 1', t2?.Nm || 'Team 2'],
        score: [
          { r: t1?.Sc || t1?.Scr || 0, w: t1?.Wkts || 0, o: t1?.Ovs || 0 },
          { r: t2?.Sc || t2?.Scr || 0, w: t2?.Wkts || 0, o: t2?.Ovs || 0 },
        ],
        venue:     stage?.Snm || ev?.Vnm || '',
        matchType: 'Cricket',
        series:    stage?.Cnm || '',
      })
    }
  }

  return { data: matches }
}
