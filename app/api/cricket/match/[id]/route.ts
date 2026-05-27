// @ts-nocheck
// Free Cricbuzz Cricket API — match detail proxy
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'free-cricbuzz-cricket-api.p.rapidapi.com'
const CACHE_TTL     = 30 * 1000 // 30 seconds for live data

let cache: Record<string, { data: any; ts: number }> = {}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  if (cache[id] && Date.now() - cache[id].ts < CACHE_TTL) {
    return NextResponse.json(cache[id].data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=30' },
    })
  }

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    if (cache[id]) return NextResponse.json(cache[id].data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: 'RAPIDAPI_KEY not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/cricket-match-info?matchid=${encodeURIComponent(id)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': API_KEY,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('Cricbuzz match detail error:', res.status)
      if (cache[id]) return NextResponse.json(cache[id].data, { headers: { 'X-Cache': 'STALE' } })
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 })
    }

    const raw = await res.json()
    const normalized = normalizeMatchDetail(raw, id)
    cache[id] = { data: normalized, ts: Date.now() }

    return NextResponse.json(normalized, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=30' },
    })
  } catch (err: any) {
    console.error('Cricket match detail error:', err.message)
    if (cache[id]) return NextResponse.json(cache[id].data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}

function normalizeMatchDetail(raw: any, id: string) {
  // Free Cricbuzz API match info response
  const info  = raw?.matchInfo  || raw?.matchDetails?.matchInfo  || raw
  const score = raw?.matchScore || raw?.matchDetails?.matchScore || {}

  if (!info?.team1 && !info?.matchId) {
    return { error: 'Match not found', id }
  }

  const team1 = info?.team1 || {}
  const team2 = info?.team2 || {}
  const state  = info?.state  || ''
  const status = info?.status || ''

  const isLive      = state === 'In Progress'
  const isCompleted = state === 'Complete'

  // Build innings from score
  const innings: any[] = []
  const t1Inngs1 = score?.team1Score?.inngs1
  const t1Inngs2 = score?.team1Score?.inngs2
  const t2Inngs1 = score?.team2Score?.inngs1
  const t2Inngs2 = score?.team2Score?.inngs2

  if (t1Inngs1?.runs !== undefined) innings.push({ team: team1.teamName, runs: t1Inngs1.runs, wickets: t1Inngs1.wickets, overs: t1Inngs1.overs })
  if (t2Inngs1?.runs !== undefined) innings.push({ team: team2.teamName, runs: t2Inngs1.runs, wickets: t2Inngs1.wickets, overs: t2Inngs1.overs })
  if (t1Inngs2?.runs !== undefined) innings.push({ team: team1.teamName, runs: t1Inngs2.runs, wickets: t1Inngs2.wickets, overs: t1Inngs2.overs, isSecond: true })
  if (t2Inngs2?.runs !== undefined) innings.push({ team: team2.teamName, runs: t2Inngs2.runs, wickets: t2Inngs2.wickets, overs: t2Inngs2.overs, isSecond: true })

  const t1Score = t1Inngs2 || t1Inngs1 || {}
  const t2Score = t2Inngs2 || t2Inngs1 || {}

  return {
    id,
    name:         `${team1.teamName || 'Team 1'} vs ${team2.teamName || 'Team 2'}`,
    status,
    statusText:   status,
    matchStarted: isLive || isCompleted,
    matchEnded:   isCompleted,
    isLive,
    teams:        [team1.teamName || 'Team 1', team2.teamName || 'Team 2'],
    teamShort:    [team1.teamSName || '', team2.teamSName || ''],
    score: [
      { r: t1Score.runs || 0, w: t1Score.wickets || 0, o: t1Score.overs || 0 },
      { r: t2Score.runs || 0, w: t2Score.wickets || 0, o: t2Score.overs || 0 },
    ],
    innings,
    venue:     info?.venueInfo?.ground || info?.venueInfo?.city || '',
    series:    info?.seriesName || '',
    matchType: info?.matchFormat || info?.matchType || 'Cricket',
    date:      info?.startDate  || '',
    toss:      info?.tossResults ? `${info.tossResults.tossWinnerName} won the toss` : '',
  }
}
