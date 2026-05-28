// @ts-nocheck
// Fetch detailed job info from Sarkari Result API and cache for 5 hours
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'sarkari-result.p.rapidapi.com'
const CACHE_TTL = 5 * 60 * 60 * 1000 // 5 hours

let cache: Record<string, { data: any; ts: number }> = {}

async function fetchJobDetail(jobId: string, apiKey: string) {
  const cacheKey = `job-${jobId}`
  
  // Check cache first
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return { data: cache[cacheKey].data, fromCache: true }
  }

  try {
    // Try to fetch from Sarkari Result API
    const res = await fetch(`https://${RAPIDAPI_HOST}/job/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': apiKey,
      },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    
    // Cache the result
    cache[cacheKey] = { data, ts: Date.now() }
    return { data, fromCache: false }
  } catch (err) {
    console.error('Error fetching job detail:', err)
    throw err
  }
}

export async function POST(req: NextRequest) {
  const { jobId, title, org, type } = await req.json()

  const API_KEY = process.env.RAPIDAPI_KEY
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 503 })
  }

  try {
    const { data, fromCache } = await fetchJobDetail(jobId, API_KEY)

    // Normalize the response
    const detail = {
      id: data.id || jobId,
      title: data.title || title,
      organization: data.organization || org,
      type: data.type || type,
      overview: data.overview || data.description || '',
      
      // Key Information
      totalVacancy: data.totalVacancy || data.vacancy || data.posts || '',
      salary: data.salary || data.salaryText || '',
      officialWebsite: data.officialWebsite || data.website || data.link || '',
      
      // Eligibility
      eligibility: {
        education: data.eligibility?.education || data.qualification || '',
        age: data.eligibility?.age || data.ageLimit || '',
        experience: data.eligibility?.experience || '',
      },
      
      // Important Dates
      importantDates: {
        notificationDate: data.importantDates?.notificationDate || data.notificationDate || '',
        applicationStart: data.importantDates?.applicationStart || data.startDate || '',
        lastDate: data.importantDates?.lastDate || data.lastDate || '',
        examDate: data.importantDates?.examDate || data.examDate || '',
        resultDate: data.importantDates?.resultDate || data.resultDate || '',
      },
      
      // Application Fee
      applicationFee: {
        general: data.applicationFee?.general || data.fee?.general || '',
        scSt: data.applicationFee?.scSt || data.fee?.scSt || '',
        paymentMode: data.applicationFee?.paymentMode || data.fee?.paymentMode || '',
      },
      
      // Selection Process
      selectionProcess: data.selectionProcess || data.selection || [],
      
      // How to Apply
      howToApply: data.howToApply || data.applySteps || [],
      
      // Additional Info
      additionalInfo: data.additionalInfo || data.notes || '',
    }

    return NextResponse.json(
      { detail, cached: fromCache },
      { headers: { 'X-Cache': fromCache ? 'HIT' : 'MISS', 'Cache-Control': 'public, max-age=18000' } }
    )
  } catch (err: any) {
    console.error('Detail API error:', err.message)
    
    // Return cached data if available
    const cacheKey = `job-${jobId}`
    if (cache[cacheKey]) {
      return NextResponse.json(
        { detail: cache[cacheKey].data, cached: true, stale: true },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
