// @ts-nocheck
// Cricket utility lib — migrated to LiveScore6 RapidAPI
// All cricket API calls now go through /api/cricket/* route handlers
// which use RAPIDAPI_KEY (LiveScore6) instead of CRICKETDATA_API_KEY (CricAPI)

const RAPIDAPI_HOST = 'livescore6.p.rapidapi.com'

// Simple in-memory cache
const cache: Record<string, { data: any; ts: number }> = {}
const TTL = 15 * 60 * 1000 // 15 minutes

async function fetchLiveScore6(path: string, params: Record<string, string> = {}) {
  const API_KEY = process.env.RAPIDAPI_KEY || ''
  if (!API_KEY) return null

  const url = new URL(`https://${RAPIDAPI_HOST}/${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const cacheKey = url.toString()
  const now = Date.now()
  if (cache[cacheKey] && now - cache[cacheKey].ts < TTL) return cache[cacheKey].data

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': API_KEY,
      },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`LiveScore6 API error: ${res.status}`)
    const json = await res.json()
    cache[cacheKey] = { data: json, ts: now }
    return json
  } catch (err) {
    console.error('[LiveScore6 Cricket]', err)
    return null
  }
}

export async function getLiveMatches() {
  return fetchLiveScore6('matches/v2/list-live', { category: 'cricket', timezone: '5.5' })
}

export async function getMatchDetail(eid: string) {
  return fetchLiveScore6('matches/v2/get-detail', { Eid: eid, Category: 'cricket' })
}

// Format match status for display
export function formatMatchStatus(match: any): string {
  if (!match) return 'Unknown'
  if (match.matchStarted && !match.matchEnded) return 'LIVE'
  if (match.matchEnded) return 'Completed'
  return 'Upcoming'
}

// Get team score string from normalized match data
export function getTeamScore(score: { r: number; w: number; o: string | number } | undefined): string {
  if (!score || (!score.r && !score.w)) return '—'
  return `${score.r}/${score.w}${score.o ? ` (${score.o} ov)` : ''}`
}
