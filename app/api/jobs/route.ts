// @ts-nocheck
// IndianAPI.in Jobs API — backend proxy with MongoDB cache
// API key NEVER sent to frontend — server-side only
// Cache strategy: 6 hours in MongoDB to preserve 75-hour free quota
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import JobCache from '../../models/JobCache'

const JOBS_API_BASE = 'https://jobs.indianapi.in'
const CACHE_TTL_MS  = 72 * 60 * 60 * 1000 // 72 hours (3 days) — only 10 hits/month allowed

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit      = searchParams.get('limit')      || '20'
  const location   = searchParams.get('location')   || ''
  const title      = searchParams.get('title')      || ''
  const experience = searchParams.get('experience') || ''
  const job_type   = searchParams.get('job_type')   || ''

  // Build cache key
  const cacheKey = `jobs_${limit}_${location}_${title}_${experience}_${job_type}`

  await connectDB()

  // Check MongoDB cache first
  const cached = await JobCache.findOne({ cacheKey }).lean()
  if (cached && (Date.now() - new Date(cached.fetchedAt).getTime()) < CACHE_TTL_MS) {
    return NextResponse.json(
      { jobs: cached.jobs, total: cached.total, source: 'cache', cachedAt: cached.fetchedAt },
      { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=21600' } }
    )
  }

  // Check API key
  const API_KEY = process.env.INDIANAPI_KEY
  if (!API_KEY) {
    // Return cached stale data if available, else empty
    if (cached) {
      return NextResponse.json(
        { jobs: cached.jobs, total: cached.total, source: 'stale-cache' },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    return NextResponse.json({ jobs: [], total: 0, error: 'Jobs API key not configured' }, { status: 200 })
  }

  try {
    const params = new URLSearchParams({ limit })
    if (location)   params.set('location', location)
    if (title)      params.set('title', title)
    if (experience) params.set('experience', experience)
    if (job_type)   params.set('job_type', job_type)

    const res = await fetch(`${JOBS_API_BASE}/jobs?${params}`, {
      headers: {
        'X-Api-Key': API_KEY, // Key only used here — never reaches browser
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('IndianAPI error:', res.status, await res.text())
      // Return stale cache if available
      if (cached) {
        return NextResponse.json(
          { jobs: cached.jobs, total: cached.total, source: 'stale-cache' },
          { headers: { 'X-Cache': 'STALE' } }
        )
      }
      return NextResponse.json({ jobs: [], total: 0 }, { status: 200 })
    }

    const data = await res.json()
    const jobs = Array.isArray(data) ? data : (data.jobs || data.data || [])

    // Save to MongoDB cache
    await JobCache.findOneAndUpdate(
      { cacheKey },
      { jobs, total: jobs.length, fetchedAt: new Date() },
      { upsert: true, new: true }
    )

    return NextResponse.json(
      { jobs, total: jobs.length, source: 'api' },
      { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=21600' } }
    )
  } catch (err: any) {
    console.error('Jobs API error:', err.message)
    if (cached) {
      return NextResponse.json(
        { jobs: cached.jobs, total: cached.total, source: 'stale-cache' },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    return NextResponse.json({ jobs: [], total: 0 }, { status: 200 })
  }
}
