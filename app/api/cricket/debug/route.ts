// @ts-nocheck
// Debug endpoint — check LiveScore6 RapidAPI cricket status
// Visit: /api/cricket/debug
import { NextResponse } from 'next/server'

export async function GET() {
  const API_KEY = process.env.RAPIDAPI_KEY
  const HOST    = 'livescore6.p.rapidapi.com'

  if (!API_KEY) {
    return NextResponse.json({
      status: 'error',
      issue: 'RAPIDAPI_KEY not set in environment variables',
      fix: 'Add RAPIDAPI_KEY in Render Dashboard → Environment',
      note: 'CRICKETDATA_API_KEY is no longer required — cricket now uses LiveScore6 via RapidAPI',
    })
  }

  try {
    // Test live matches endpoint
    const res = await fetch(
      `https://${HOST}/matches/v2/list-live?category=cricket&timezone=5.5`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': HOST,
          'x-rapidapi-key': API_KEY,
        },
      }
    )

    const text = await res.text()
    let data: any = {}
    try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 300) } }

    const stages  = data?.Stages || []
    const matches = stages.flatMap((s: any) => s?.Events || [])

    return NextResponse.json({
      status:        res.ok ? 'ok' : 'error',
      httpStatus:    res.status,
      apiKeyPresent: true,
      apiKeyPrefix:  API_KEY.slice(0, 8) + '...',
      host:          HOST,
      stagesCount:   stages.length,
      matchCount:    matches.length,
      sampleMatch:   matches[0] ? {
        eid:    matches[0]?.Eid,
        teams:  [matches[0]?.T1?.[0]?.Nm, matches[0]?.T2?.[0]?.Nm],
        status: matches[0]?.Eps,
        score1: matches[0]?.T1?.[0]?.Sc,
        score2: matches[0]?.T2?.[0]?.Sc,
      } : null,
      endpoints: {
        liveMatches:  `https://${HOST}/matches/v2/list-live?category=cricket&timezone=5.5`,
        matchDetail:  `https://${HOST}/matches/v2/get-detail?Eid=<match_eid>&Category=cricket`,
      },
      rawPreview: text.slice(0, 400),
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'fetch_error', error: err.message })
  }
}
