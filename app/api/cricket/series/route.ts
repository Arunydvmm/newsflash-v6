// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

const API_KEY  = process.env.CRICKETDATA_API_KEY
const BASE_URL = 'https://api.cricapi.com/v1'

let cache: Record<string, { data: any; ts: number }> = {}
const TTL = 5 * 60 * 1000 // 5 min cache for series data

export async function GET(req: NextRequest) {
  const type     = req.nextUrl.searchParams.get('type') || 'series'
  const seriesId = req.nextUrl.searchParams.get('id')   || ''

  const cacheKey = `${type}_${seriesId}`
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < TTL) {
    return NextResponse.json(cache[cacheKey].data, { headers: { 'X-Cache': 'HIT' } })
  }

  if (!API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 503 })

  try {
    let url = ''
    switch (type) {
      case 'series':
        url = `${BASE_URL}/series?apikey=${API_KEY}&offset=0`
        break
      case 'series_info':
        url = `${BASE_URL}/series_info?apikey=${API_KEY}&id=${seriesId}`
        break
      case 'points_table':
        url = `${BASE_URL}/series_points_table?apikey=${API_KEY}&id=${seriesId}`
        break
      case 'players':
        url = `${BASE_URL}/series_squad?apikey=${API_KEY}&id=${seriesId}`
        break
      default:
        url = `${BASE_URL}/series?apikey=${API_KEY}&offset=0`
    }

    const res  = await fetch(url)
    const data = await res.json()
    cache[cacheKey] = { data, ts: Date.now() }
    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    if (cache[cacheKey]) return NextResponse.json(cache[cacheKey].data, { headers: { 'X-Cache': 'STALE' } })
    return NextResponse.json({ error: 'Failed to fetch series data' }, { status: 502 })
  }
}
