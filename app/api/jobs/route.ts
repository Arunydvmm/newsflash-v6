// @ts-nocheck
// IndianAPI.in Jobs API — backend proxy with MongoDB cache
// API key NEVER sent to frontend — server-side only
// Cache strategy: 72 hours in MongoDB — only 10 hits/month allowed
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import JobCache from '../../models/JobCache'

const JOBS_API_BASE = 'https://jobs.indianapi.in'
const CACHE_TTL_MS  = 72 * 60 * 60 * 1000 // 72 hours
const MASTER_KEY    = 'jobs_master' // Single shared cache key — all requests use same pool

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit      = parseInt(searchParams.get('limit') || '20')
  const location   = searchParams.get('location')   || ''
  const title      = searchParams.get('title')      || ''
  const experience = searchParams.get('experience') || ''
  const job_type   = searchParams.get('job_type')   || ''

  await connectDB()

  // Always look up master cache
  const cached = await JobCache.findOne({ cacheKey: MASTER_KEY }).lean()

  // Filter + slice from cached pool if fresh
  if (cached && (Date.now() - new Date(cached.fetchedAt).getTime()) < CACHE_TTL_MS) {
    let jobs = cached.jobs || []

    // Apply filters on cached data
    if (location)   jobs = jobs.filter((j: any) => j.location?.toLowerCase().includes(location.toLowerCase()))
    if (title)      jobs = jobs.filter((j: any) => (j.title || j.job_title || '').toLowerCase().includes(title.toLowerCase()))
    if (experience) jobs = jobs.filter((j: any) => j.experience?.toLowerCase().includes(experience.toLowerCase()))
    if (job_type)   jobs = jobs.filter((j: any) => j.job_type?.toLowerCase().includes(job_type.toLowerCase()))

    return NextResponse.json(
      { jobs: jobs.slice(0, limit), total: jobs.length, source: 'cache', cachedAt: cached.fetchedAt },
      { headers: { 'X-Cache': 'HIT' } }
    )
  }

  // Cache miss or stale — fetch from API
  const API_KEY = process.env.INDIANAPI_KEY
  if (!API_KEY) {
    // Return stale data if available
    if (cached?.jobs?.length > 0) {
      return NextResponse.json(
        { jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    return NextResponse.json({ jobs: [], total: 0, error: 'Jobs API key not configured' })
  }

  try {
    // Always fetch max (50) to fill the master cache pool
    const res = await fetch(`${JOBS_API_BASE}/jobs?limit=50`, {
      headers: {
        'X-Api-Key': API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('IndianAPI error:', res.status)
      if (cached?.jobs?.length > 0) {
        return NextResponse.json(
          { jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' },
          { headers: { 'X-Cache': 'STALE' } }
        )
      }
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const data = await res.json()
    const allJobs = Array.isArray(data) ? data : (data.jobs || data.data || [])

    // Save full pool to master cache
    await JobCache.findOneAndUpdate(
      { cacheKey: MASTER_KEY },
      { jobs: allJobs, total: allJobs.length, fetchedAt: new Date() },
      { upsert: true, new: true }
    )

    // Apply filters and return
    let jobs = allJobs
    if (location)   jobs = jobs.filter((j: any) => j.location?.toLowerCase().includes(location.toLowerCase()))
    if (title)      jobs = jobs.filter((j: any) => (j.title || j.job_title || '').toLowerCase().includes(title.toLowerCase()))
    if (experience) jobs = jobs.filter((j: any) => j.experience?.toLowerCase().includes(experience.toLowerCase()))
    if (job_type)   jobs = jobs.filter((j: any) => j.job_type?.toLowerCase().includes(job_type.toLowerCase()))

    return NextResponse.json(
      { jobs: jobs.slice(0, limit), total: jobs.length, source: 'api' },
      { headers: { 'X-Cache': 'MISS' } }
    )
  } catch (err: any) {
    console.error('Jobs API error:', err.message)
    if (cached?.jobs?.length > 0) {
      return NextResponse.json(
        { jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    return NextResponse.json({ jobs: [], total: 0 })
  }
}
