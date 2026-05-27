// @ts-nocheck
// RapidAPI Active Jobs DB — backend proxy with MongoDB cache
// API key NEVER sent to frontend — server-side only
// Cache: 72 hours to preserve free tier quota
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import JobCache from '../../models/JobCache'

const JOBS_API_HOST = 'active-jobs-db.p.rapidapi.com'
const JOBS_API_BASE = `https://${JOBS_API_HOST}`
const CACHE_TTL_MS  = 72 * 60 * 60 * 1000 // 72 hours
const MASTER_KEY    = 'jobs_master_v2'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit      = parseInt(searchParams.get('limit') || '20')
  const location   = searchParams.get('location')   || 'India'
  const title      = searchParams.get('title')      || ''
  const experience = searchParams.get('experience') || ''

  await connectDB()

  // Check MongoDB cache first
  const cached = await JobCache.findOne({ cacheKey: MASTER_KEY }).lean()
  if (cached && (Date.now() - new Date(cached.fetchedAt).getTime()) < CACHE_TTL_MS) {
    let jobs = cached.jobs || []
    // Filter on cached data
    if (title)      jobs = jobs.filter((j: any) => (j.title || '').toLowerCase().includes(title.toLowerCase()))
    if (experience) jobs = jobs.filter((j: any) => (j.experience || '').toLowerCase().includes(experience.toLowerCase()))
    return NextResponse.json(
      { jobs: jobs.slice(0, limit), total: jobs.length, source: 'cache', cachedAt: cached.fetchedAt },
      { headers: { 'X-Cache': 'HIT' } }
    )
  }

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    if (cached?.jobs?.length > 0) {
      return NextResponse.json({ jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' })
    }
    return NextResponse.json({ jobs: [], total: 0, error: 'RapidAPI key not configured' })
  }

  try {
    // Fetch India jobs — encode properly
    const locationFilter = encodeURIComponent('"India" OR "Remote"')
    const url = `${JOBS_API_BASE}/active-ats-1h?offset=0&location_filter=${locationFilter}&description_type=text`

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': JOBS_API_HOST,
        'x-rapidapi-key': API_KEY, // Never reaches browser
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('RapidAPI Jobs error:', res.status, errText)
      // 403 = not subscribed — return empty silently so widget hides
      if (res.status === 403) {
        return NextResponse.json({ jobs: [], total: 0, notSubscribed: true })
      }
      if (cached?.jobs?.length > 0) {
        return NextResponse.json({ jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' })
      }
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const data = await res.json()
    // RapidAPI active-jobs-db returns array directly
    const rawJobs = Array.isArray(data) ? data : (data.jobs || data.data || [])

    // Normalize job structure
    const jobs = rawJobs.map((j: any) => ({
      id:           j.id || j.job_id,
      title:        j.title || j.job_title || '',
      company:      j.company || j.employer_name || '',
      location:     j.location || j.job_city || j.job_country || '',
      job_type:     j.employment_type || j.job_type || 'Full Time',
      experience:   j.experience_level || j.experience || '',
      apply_link:   j.url || j.job_apply_link || j.apply_link || '',
      posted_date:  j.date_posted || j.job_posted_at_datetime_utc || j.posted_date || '',
      description:  (j.description || j.job_description || '').slice(0, 200),
      about_company: j.company_description || '',
    })).filter((j: any) => j.title && j.apply_link)

    // Save to MongoDB cache
    await JobCache.findOneAndUpdate(
      { cacheKey: MASTER_KEY },
      { jobs, total: jobs.length, fetchedAt: new Date() },
      { upsert: true, new: true }
    )

    let filtered = jobs
    if (title)      filtered = filtered.filter((j: any) => j.title.toLowerCase().includes(title.toLowerCase()))
    if (experience) filtered = filtered.filter((j: any) => (j.experience || '').toLowerCase().includes(experience.toLowerCase()))

    return NextResponse.json(
      { jobs: filtered.slice(0, limit), total: filtered.length, source: 'api' },
      { headers: { 'X-Cache': 'MISS' } }
    )
  } catch (err: any) {
    console.error('Jobs API error:', err.message)
    if (cached?.jobs?.length > 0) {
      return NextResponse.json({ jobs: cached.jobs.slice(0, limit), total: cached.jobs.length, source: 'stale' })
    }
    return NextResponse.json({ jobs: [], total: 0 })
  }
}
