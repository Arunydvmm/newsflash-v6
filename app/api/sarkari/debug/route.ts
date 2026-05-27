// @ts-nocheck
// Debug endpoint — check Sarkari Result RapidAPI status
// Visit: /api/sarkari/debug
import { NextResponse } from 'next/server'

export async function GET() {
  const API_KEY = process.env.RAPIDAPI_KEY
  const HOST    = 'sarkari-result.p.rapidapi.com'

  if (!API_KEY) {
    return NextResponse.json({
      status: 'error',
      issue: 'RAPIDAPI_KEY not set',
      fix: 'Add RAPIDAPI_KEY in Render Dashboard → Environment',
    })
  }

  const results: any = {}

  // Test all known endpoints
  for (const endpoint of ['/results/', '/jobs/', '/admit-card/', '/answer-key/']) {
    try {
      const res  = await fetch(`https://${HOST}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': HOST,
          'x-rapidapi-key': API_KEY,
        },
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 200) } }

      const arr = Array.isArray(data) ? data : (data?.data || data?.results || data?.jobs || data?.items || [])
      results[endpoint] = {
        httpStatus: res.status,
        ok:         res.ok,
        itemCount:  arr.length,
        sample:     arr[0] || data,
        rawPreview: text.slice(0, 300),
      }
    } catch (e: any) {
      results[endpoint] = { error: e.message }
    }
  }

  return NextResponse.json({
    status:        'tested',
    apiKeyPresent: true,
    apiKeyPrefix:  API_KEY.slice(0, 8) + '...',
    host:          HOST,
    endpoints:     results,
  })
}
