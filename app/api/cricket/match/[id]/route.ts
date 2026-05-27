// @ts-nocheck
// LiveScore6 RapidAPI — cricket match detail proxy
// Fetches event detail from LiveScore6 using the match Eid
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'livescore6.p.rapidapi.com'
const CACHE_TTL     = 30 * 1000 // 30 seconds for live match data

let cache: Record<string, { data: any; ts: number }> = {}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  // Serve from cache if fresh
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
    // LiveScore6 match detail endpoint
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/matches/v2/get-detail?Eid=${encodeURIComponent(id)}&Category=cricket`,
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
      console.error('LiveScore6 match detail error:', res.status)
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
  // LiveScore6 detail response structure
  const event = raw?.Stages?.[0]?.Events?.[0] || raw?.event || raw

  if (!event || (!event.T1 && !event.Eid)) {
    return { error: 'Match not found', id }
  }

  const t1 = event?.T1?.[0] || {}
  const t2 = event?.T2?.[0] || {}
  const stage = raw?.Stages?.[0] || {}

  const isLive      = event?.Eps === 'Live' || event?.Eps === 'HT'
  const isCompleted = event?.Eps === 'Fin'  || event?.Eps === 'FT'

  // Build innings data from LiveScore6 cricket-specific fields
  // LiveScore6 provides Tr1C1, Tr1C2 (innings scores) and Tr1CW1, Tr1CW2 (wickets)
  const innings: any[] = []

  if (t1?.Nm) {
    const inn1 = {
      team:    t1.Nm,
      runs:    t1.Sc  || t1.Scr || event?.Tr1C1 || 0,
      wickets: t1.Wkts || event?.Tr1CW1 || 0,
      overs:   t1.Ovs  || event?.Tr1CO1  || '',
      extras:  '',
    }
    if (inn1.runs || inn1.wickets) innings.push(inn1)

    // Second innings of team 1 (if exists)
    if (event?.Tr1C2 !== undefined && event?.Tr1C2 !== '') {
      innings.push({
        team:    t1.Nm,
        runs:    event.Tr1C2,
        wickets: event.Tr1CW2 || 0,
        overs:   event.Tr1CO2 || '',
        extras:  '',
        isSecond: true,
      })
    }
  }

  if (t2?.Nm) {
    const inn2 = {
      team:    t2.Nm,
      runs:    t2.Sc  || t2.Scr || event?.Tr2C1 || 0,
      wickets: t2.Wkts || event?.Tr2CW1 || 0,
      overs:   t2.Ovs  || event?.Tr2CO1  || '',
      extras:  '',
    }
    if (inn2.runs || inn2.wickets) innings.push(inn2)

    if (event?.Tr2C2 !== undefined && event?.Tr2C2 !== '') {
      innings.push({
        team:    t2.Nm,
        runs:    event.Tr2C2,
        wickets: event.Tr2CW2 || 0,
        overs:   event.Tr2CO2 || '',
        extras:  '',
        isSecond: true,
      })
    }
  }

  return {
    id,
    name:         `${t1?.Nm || 'Team 1'} vs ${t2?.Nm || 'Team 2'}`,
    status:       event?.Eps === 'Live' ? 'Live' : event?.Eps || '',
    statusText:   event?.Esid || event?.Esd || '',
    matchStarted: isLive || isCompleted,
    matchEnded:   isCompleted,
    isLive,
    teams:        [t1?.Nm || 'Team 1', t2?.Nm || 'Team 2'],
    score: [
      { r: t1?.Sc || t1?.Scr || 0, w: t1?.Wkts || 0, o: t1?.Ovs || '' },
      { r: t2?.Sc || t2?.Scr || 0, w: t2?.Wkts || 0, o: t2?.Ovs || '' },
    ],
    innings,
    venue:        stage?.Snm || event?.Vnm || '',
    series:       stage?.Cnm || '',
    matchType:    'Cricket',
    date:         event?.Esd || '',
    // Raw event for debugging
    _raw: process.env.NODE_ENV === 'development' ? event : undefined,
  }
}
