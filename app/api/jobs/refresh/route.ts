// @ts-nocheck
// Manual job cache refresh — admin only, uses 1 API hit
// Call: POST /api/jobs/refresh with admin auth
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import JobCache from '../../../models/JobCache'
import { getAuth } from '../../../lib/auth'

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const API_KEY = process.env.INDIANAPI_KEY
  if (!API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 503 })

  await connectDB()

  // Check how many hits used this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const hitsThisMonth = await JobCache.countDocuments({
    fetchedAt: { $gte: monthStart },
    cacheKey: { $regex: '^jobs_' },
  })

  if (hitsThisMonth >= 9) {
    return NextResponse.json({
      error: `API quota almost exhausted. ${hitsThisMonth} hits used this month. Limit: 10.`,
      hitsUsed: hitsThisMonth,
    }, { status: 429 })
  }

  try {
    const res = await fetch('https://jobs.indianapi.in/jobs?limit=50', {
      headers: { 'X-Api-Key': API_KEY, 'Accept': 'application/json' },
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    const jobs = Array.isArray(data) ? data : (data.jobs || [])

    await JobCache.findOneAndUpdate(
      { cacheKey: 'jobs_master' },
      { jobs, total: jobs.length, fetchedAt: new Date() },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      jobsLoaded: jobs.length,
      hitsUsed: hitsThisMonth + 1,
      hitsRemaining: 10 - (hitsThisMonth + 1),
      nextRefreshAllowed: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — check quota status without using a hit
export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const hitsThisMonth = await JobCache.countDocuments({
    fetchedAt: { $gte: monthStart },
    cacheKey: { $regex: '^jobs_' },
  })

  const lastCache = await JobCache.findOne({ cacheKey: 'jobs_master' }).lean()

  return NextResponse.json({
    hitsUsed: hitsThisMonth,
    hitsRemaining: Math.max(0, 10 - hitsThisMonth),
    lastFetched: lastCache?.fetchedAt || null,
    jobsInCache: lastCache?.total || 0,
    cacheExpiresAt: lastCache ? new Date(new Date(lastCache.fetchedAt).getTime() + 72 * 60 * 60 * 1000).toISOString() : null,
    cacheFresh: lastCache ? (Date.now() - new Date(lastCache.fetchedAt).getTime()) < 72 * 60 * 60 * 1000 : false,
  })
}
