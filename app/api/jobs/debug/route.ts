// @ts-nocheck
// Debug endpoint — check jobs API status
// Visit: /api/jobs/debug to diagnose
import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import JobCache from '../../../models/JobCache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const API_KEY = process.env.INDIANAPI_KEY

  await connectDB()
  const cached = await JobCache.findOne({ cacheKey: 'jobs_master' }).lean()

  // Test API directly
  let apiTest: any = { tested: false }
  if (API_KEY) {
    try {
      const res = await fetch('https://jobs.indianapi.in/jobs?limit=3', {
        headers: { 'X-Api-Key': API_KEY, 'Accept': 'application/json' },
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 200) } }
      apiTest = {
        tested: true,
        httpStatus: res.status,
        ok: res.ok,
        jobCount: Array.isArray(data) ? data.length : (data.jobs?.length || 0),
        sample: Array.isArray(data) ? data[0] : (data.jobs?.[0] || data),
        rawPreview: text.slice(0, 300),
      }
    } catch (e: any) {
      apiTest = { tested: true, error: e.message }
    }
  }

  return NextResponse.json({
    apiKeySet: !!API_KEY,
    apiKeyPrefix: API_KEY ? API_KEY.slice(0, 6) + '...' : 'NOT SET',
    cache: {
      exists: !!cached,
      jobCount: cached?.jobs?.length || 0,
      fetchedAt: cached?.fetchedAt || null,
      ageHours: cached ? Math.round((Date.now() - new Date(cached.fetchedAt).getTime()) / 3600000) : null,
      fresh: cached ? (Date.now() - new Date(cached.fetchedAt).getTime()) < 72 * 3600000 : false,
      sampleJob: cached?.jobs?.[0] || null,
    },
    apiTest,
  })
}
