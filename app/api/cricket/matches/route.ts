// @ts-nocheck
// Free Cricbuzz Cricket API (RapidAPI) — cricket matches backend proxy
// Host: free-cricbuzz-cricket-api.p.rapidapi.com
// API key NEVER sent to frontend
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'free-cricbuzz-cricket-api.p.rapidapi.com'
const CACHE_TTL     = 10 * 60 * 1000 // 10 minutes

let cache: { data: any; ts: number } | null = null

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'matches'

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=600' },
    })
  }

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: 'RAPIDAPI_KEY not configured', data: [] }, { status: 503 })
  }

  try {
    // Free Cricbuzz API — cricket-matches returns live + recent + upcoming
    const res = await fetch(`https://${RAPIDAPI_HOST}/cricket-matches`, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Cricbuzz API error:', res.status, errText)
      if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
      return NextResponse.json({ error: `API error: ${res.status}`, data: [] }, { status: 502 })
    }

    const raw = await res.json()
    const normalized = normalizeCricbuzz(raw)
    cache = { data: normalized, ts: Date.now() }

    return NextResponse.json(normalized, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=600' },
    })
  } catch (err: any) {
    console.error('Cricket API error:', err.message)
    if (cache) return NextResponse.json(cache.data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: err.message, data: [] }, { status: 502 })
  }
}

function normalizeCricbuzz(raw: any) {
  // Free Cricbuzz API response structure:
  // { typeMatches: [ { matchType, seriesMatches: [ { seriesAdWrapper: { seriesName, matches: [ { matchInfo, matchScore } ] } } ] } ] }
  const matches: any[] = []

  const typeMatches = raw?.typeMatches || []

  for (const typeMatch of typeMatches) {
    const seriesMatches = typeMatch?.seriesMatches || []
    for (const sm of seriesMatches) {
      const wrapper = sm?.seriesAdWrapper || sm
      const seriesName = wrapper?.seriesName || ''
      const matchList  = wrapper?.matches || []

      for (const m of matchList) {
        const info  = m?.matchInfo  || {}
        const score = m?.matchScore || {}

        const matchId   = info?.matchId   || info?.id
        const team1     = info?.team1     || {}
        const team2     = info?.team2     || {}
        const state     = info?.state     || ''   // 'In Progress', 'Complete', 'Preview'
        const status    = info?.status    || ''
        const matchType = info?.matchFormat || info?.matchType || 'T20'
        const venue     = info?.venueInfo?.ground || info?.venueInfo?.city || ''

        const isLive      = state === 'In Progress'
        const isCompleted = state === 'Complete'

        // Score extraction
        const t1Score = score?.team1Score?.inngs1 || score?.team1Score?.inngs2 || {}
        const t2Score = score?.team2Score?.inngs1 || score?.team2Score?.inngs2 || {}

        matches.push({
          id:           String(matchId),
          name:         `${team1?.teamName || 'Team 1'} vs ${team2?.teamName || 'Team 2'}`,
          shortName:    `${team1?.teamSName || ''} vs ${team2?.teamSName || ''}`,
          status,
          matchStarted: isLive || isCompleted,
          matchEnded:   isCompleted,
          teams:        [team1?.teamName || 'Team 1', team2?.teamName || 'Team 2'],
          teamShort:    [team1?.teamSName || '', team2?.teamSName || ''],
          score: [
            { r: t1Score?.runs || 0, w: t1Score?.wickets || 0, o: t1Score?.overs || 0 },
            { r: t2Score?.runs || 0, w: t2Score?.wickets || 0, o: t2Score?.overs || 0 },
          ],
          venue,
          matchType,
          series: seriesName,
        })
      }
    }
  }

  return { data: matches }
}
