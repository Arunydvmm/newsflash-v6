// @ts-nocheck
// Debug endpoint — check cricket API status without using cache
// Visit: /api/cricket/debug to diagnose issues
import { NextResponse } from 'next/server'

export async function GET() {
  const API_KEY  = process.env.CRICKETDATA_API_KEY
  const BASE_URL = 'https://api.cricapi.com/v1'

  if (!API_KEY) {
    return NextResponse.json({
      status: 'error',
      issue: 'CRICKETDATA_API_KEY not set in environment variables',
      fix: 'Add CRICKETDATA_API_KEY in Render Dashboard → Environment',
    })
  }

  try {
    // Test the API directly — no cache
    const res = await fetch(`${BASE_URL}/currentMatches?apikey=${API_KEY}&offset=0`)
    const data = await res.json()

    return NextResponse.json({
      status: res.ok ? 'ok' : 'error',
      httpStatus: res.status,
      apiKeyPresent: true,
      apiKeyPrefix: API_KEY.slice(0, 6) + '...',
      responseStatus: data?.status,
      matchCount: data?.data?.length || 0,
      matches: data?.data?.slice(0, 3).map((m: any) => ({
        name: m.name,
        status: m.status,
        matchStarted: m.matchStarted,
        matchEnded: m.matchEnded,
        teams: m.teams,
      })) || [],
      rawInfo: data?.info || null,
      error: data?.status === 'failure' ? data : null,
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'fetch_error',
      error: err.message,
      fix: 'Check if cricapi.com is accessible from Render servers',
    })
  }
}
