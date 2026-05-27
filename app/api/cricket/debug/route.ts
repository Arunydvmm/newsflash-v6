// @ts-nocheck
// Debug endpoint — check Free Cricbuzz Cricket API status
// Visit: /api/cricket/debug
import { NextResponse } from 'next/server'

export async function GET() {
  const API_KEY = process.env.RAPIDAPI_KEY
  const HOST    = 'free-cricbuzz-cricket-api.p.rapidapi.com'

  if (!API_KEY) {
    return NextResponse.json({
      status: 'error',
      issue: 'RAPIDAPI_KEY not set in environment variables',
      fix: 'Add RAPIDAPI_KEY in Render Dashboard → Environment',
    })
  }

  try {
    const res = await fetch(`https://${HOST}/cricket-matches`, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': HOST,
        'x-rapidapi-key': API_KEY,
      },
    })

    const text = await res.text()
    let data: any = {}
    try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 300) } }

    // Count matches across all types
    const typeMatches = data?.typeMatches || []
    let matchCount = 0
    let sampleMatch: any = null

    for (const tm of typeMatches) {
      for (const sm of (tm?.seriesMatches || [])) {
        const matches = sm?.seriesAdWrapper?.matches || []
        matchCount += matches.length
        if (!sampleMatch && matches[0]) {
          const m = matches[0]
          sampleMatch = {
            id:     m?.matchInfo?.matchId,
            teams:  [m?.matchInfo?.team1?.teamName, m?.matchInfo?.team2?.teamName],
            status: m?.matchInfo?.status,
            state:  m?.matchInfo?.state,
            series: sm?.seriesAdWrapper?.seriesName,
          }
        }
      }
    }

    return NextResponse.json({
      status:        res.ok ? 'ok' : 'error',
      httpStatus:    res.status,
      apiKeyPresent: true,
      apiKeyPrefix:  API_KEY.slice(0, 8) + '...',
      host:          HOST,
      typeMatchCount: typeMatches.length,
      matchCount,
      sampleMatch,
      rawPreview: text.slice(0, 500),
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'fetch_error', error: err.message })
  }
}
