// @ts-nocheck
// Cricket players — not currently surfaced in UI
// LiveScore6 does not provide a player search/info endpoint for cricket.
// This route returns an empty response to avoid broken API calls.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { data: [], message: 'Player search not available via current API provider (LiveScore6)' },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
