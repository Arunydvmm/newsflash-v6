// @ts-nocheck
// Cricket series / standings — uses LiveScore6 RapidAPI
// Note: LiveScore6 does not provide cricket points tables directly.
// The frontend uses built-in demo data for the IPL points table.
// This endpoint is kept for future use and returns an empty response.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'series'

  // LiveScore6 does not support cricket series/standings endpoints.
  // Return empty data so the frontend falls back to its built-in demo table.
  return NextResponse.json(
    { data: null, message: 'Series data not available via current API provider' },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
