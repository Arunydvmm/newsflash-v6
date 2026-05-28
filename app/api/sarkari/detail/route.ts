// @ts-nocheck
// Fetch job details from RapidAPI + external sources + Groq AI analysis
// Cache for 5 hours
import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_HOST = 'sarkari-result.p.rapidapi.com'
const CACHE_TTL = 5 * 60 * 60 * 1000 // 5 hours

let cache: Record<string, { data: any; ts: number }> = {}

async function fetchFromRapidAPI(jobId: string, apiKey: string) {
  try {
    const res = await fetch(`https://${RAPIDAPI_HOST}/job/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': apiKey,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('RapidAPI error:', res.status, res.statusText)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error('RapidAPI fetch error:', err)
    return null
  }
}

async function analyzeWithGroqAI(basicData: any, groqApiKey: string) {
  try {
    const prompt = `You are a job notification analyzer. Analyze this job data and return ONLY a valid JSON object (no markdown, no extra text).

Job Title: ${basicData.title}
Organization: ${basicData.organization}
Type: ${basicData.type}

Return this exact JSON structure:
{
  "overview": "2-3 sentence summary",
  "totalVacancy": "number or empty string",
  "salary": "salary details or empty string",
  "eligibility": {
    "education": "education requirement or empty string",
    "age": "age limit or empty string",
    "experience": "experience requirement or empty string"
  },
  "importantDates": {
    "notificationDate": "date or empty string",
    "applicationStart": "date or empty string",
    "lastDate": "date or empty string",
    "examDate": "date or empty string",
    "resultDate": "date or empty string"
  },
  "applicationFee": {
    "general": "fee or empty string",
    "scSt": "fee or empty string",
    "paymentMode": "mode or empty string"
  },
  "selectionProcess": ["step1", "step2"],
  "howToApply": ["step1", "step2"],
  "additionalInfo": "additional info or empty string"
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON generator. Always respond with valid JSON only, no markdown or extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Groq API error:', response.status, errorData)
      return null
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''
    
    if (!content) {
      console.error('Groq API: Empty response')
      return null
    }

    // Try to parse JSON directly
    try {
      return JSON.parse(content)
    } catch (e) {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      console.error('Groq API: Could not parse JSON from response:', content.slice(0, 100))
      return null
    }
  } catch (err) {
    console.error('Groq AI error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const { jobId, title, org, type } = await req.json()

  const cacheKey = `job-${jobId}`
  
  // Check cache first
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return NextResponse.json(
      { detail: cache[cacheKey].data, cached: true },
      { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=18000' } }
    )
  }

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
  const GROQ_API_KEY = process.env.GROQ_API_KEY

  try {
    // Step 1: Prepare basic data
    const basicData = {
      title: title || 'Job Notification',
      organization: org || 'Government Organization',
      type: type || 'jobs',
      description: '',
    }

    // Step 2: Try to fetch from RapidAPI (optional, may fail)
    let rapidData = null
    if (RAPIDAPI_KEY) {
      rapidData = await fetchFromRapidAPI(jobId, RAPIDAPI_KEY)
      if (rapidData) {
        basicData.title = rapidData.title || basicData.title
        basicData.organization = rapidData.organization || basicData.organization
        basicData.description = rapidData.description || rapidData.overview || ''
      }
    }

    // Step 3: Use Groq AI to analyze and structure (if available)
    let aiAnalysis = null
    if (GROQ_API_KEY) {
      aiAnalysis = await analyzeWithGroqAI(basicData, GROQ_API_KEY)
    }

    // Step 4: Merge and normalize
    const detail = {
      id: jobId,
      title: aiAnalysis?.title || basicData.title,
      organization: aiAnalysis?.organization || basicData.organization,
      type: aiAnalysis?.type || basicData.type,
      overview: aiAnalysis?.overview || basicData.description || 'Government job notification. Please visit the official website for complete details.',
      
      totalVacancy: aiAnalysis?.totalVacancy || rapidData?.totalVacancy || rapidData?.vacancy || '',
      salary: aiAnalysis?.salary || rapidData?.salary || rapidData?.salaryText || 'As per government norms',
      officialWebsite: rapidData?.officialWebsite || rapidData?.website || rapidData?.link || '',
      
      eligibility: {
        education: aiAnalysis?.eligibility?.education || rapidData?.qualification || 'Check official notification',
        age: aiAnalysis?.eligibility?.age || rapidData?.ageLimit || 'Check official notification',
        experience: aiAnalysis?.eligibility?.experience || '',
      },
      
      importantDates: {
        notificationDate: aiAnalysis?.importantDates?.notificationDate || rapidData?.notificationDate || '',
        applicationStart: aiAnalysis?.importantDates?.applicationStart || rapidData?.startDate || '',
        lastDate: aiAnalysis?.importantDates?.lastDate || rapidData?.lastDate || '',
        examDate: aiAnalysis?.importantDates?.examDate || rapidData?.examDate || '',
        resultDate: aiAnalysis?.importantDates?.resultDate || rapidData?.resultDate || '',
      },
      
      applicationFee: {
        general: aiAnalysis?.applicationFee?.general || rapidData?.fee?.general || 'Check official notification',
        scSt: aiAnalysis?.applicationFee?.scSt || rapidData?.fee?.scSt || 'Check official notification',
        paymentMode: aiAnalysis?.applicationFee?.paymentMode || rapidData?.fee?.paymentMode || '',
      },
      
      selectionProcess: aiAnalysis?.selectionProcess || rapidData?.selectionProcess || ['Check official notification for selection process'],
      howToApply: aiAnalysis?.howToApply || rapidData?.howToApply || ['Visit official website', 'Fill online application form', 'Submit required documents'],
      additionalInfo: aiAnalysis?.additionalInfo || rapidData?.notes || 'For more details, visit the official website',
    }

    // Cache the result
    cache[cacheKey] = { data: detail, ts: Date.now() }

    return NextResponse.json(
      { detail, cached: false, aiEnhanced: !!aiAnalysis, rapidDataAvailable: !!rapidData },
      { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=18000' } }
    )
  } catch (err: any) {
    console.error('Detail API error:', err.message)
    
    // Return cached data if available
    if (cache[cacheKey]) {
      return NextResponse.json(
        { detail: cache[cacheKey].data, cached: true, stale: true },
        { headers: { 'X-Cache': 'STALE' } }
      )
    }
    
    // Return basic fallback data
    const fallbackDetail = {
      id: jobId,
      title: title || 'Job Notification',
      organization: org || 'Government Organization',
      type: type || 'jobs',
      overview: 'Government job notification. Please visit the official website for complete details.',
      totalVacancy: '',
      salary: 'As per government norms',
      officialWebsite: '',
      eligibility: {
        education: 'Check official notification',
        age: 'Check official notification',
        experience: '',
      },
      importantDates: {
        notificationDate: '',
        applicationStart: '',
        lastDate: '',
        examDate: '',
        resultDate: '',
      },
      applicationFee: {
        general: 'Check official notification',
        scSt: 'Check official notification',
        paymentMode: '',
      },
      selectionProcess: ['Check official notification for selection process'],
      howToApply: ['Visit official website', 'Fill online application form', 'Submit required documents'],
      additionalInfo: 'For more details, visit the official website',
    }
    
    return NextResponse.json(
      { detail: fallbackDetail, error: 'Using fallback data - API unavailable' },
      { status: 200 }
    )
  }
}
