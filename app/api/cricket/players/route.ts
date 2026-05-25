// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

const API_KEY  = process.env.CRICKETDATA_API_KEY
const BASE_URL = 'https://api.cricapi.com/v1'

let cache: Record<string, { data: any; ts: number }> = {}
const TTL = 10 * 60 * 1000

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get('id') || ''
  const search   = req.nextUrl.searchParams.get('search') || ''

  const cacheKey = `player_${playerId}_${search}`
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < TTL) {
    return NextResponse.json(cache[cacheKey].data, { headers: { 'X-Cache': 'HIT' } })
  }

  if (!API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 503 })

  try {
    let url = playerId
      ? `${BASE_URL}/players_info?apikey=${API_KEY}&id=${playerId}`
      : `${BASE_URL}/players?apikey=${API_KEY}&offset=0&search=${encodeURIComponent(search)}`

    const res  = await fetch(url)
    const data = await res.json()
    cache[cacheKey] = { data, ts: Date.now() }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 502 })
  }
}
