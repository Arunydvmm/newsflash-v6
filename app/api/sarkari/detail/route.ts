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

    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error('RapidAPI error:', err)
    return null
  }
}

async function searchExternalSources(title: string, org: string) {
  try {
    // Search for official job details from government portals
    const searchQueries = [
      `${title} ${org} official notification eligibility`,
      `${org} recruitment ${title} salary qualification`,
      `${title} government job age limit experience`,
    ]

    const results: string[] = []
    
    for (const query of searchQueries) {
      try {
        const res = await fetch(
          `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        if (res.ok) {
          const text = await res.text()
          // Extract relevant snippets (basic parsing)
          const snippets = text.match(/(?:<span[^>]*>|>)([^<]*(?:eligibility|qualification|age|salary|experience)[^<]*)/gi) || []
          results.push(...snippets.slice(0, 3))
        }
      } catch (err) {
        console.error('Search error:', err)
      }
    }

    return results.join(' ')
  } catch (err) {
    console.error('External search error:', err)
    return ''
  }
}

async function analyzeWithGroqAI(basicData: any, externalInfo: string, groqApiKey: string) {
  try {
    const prompt = `Analyze and structure this job notification data into a comprehensive format:

Job Title: ${basicData.title}
Organization: ${basicData.organization}
Type: ${basicData.type}
Basic Info: ${JSON.stringify(basicData)}
External Info Found: ${externalInfo}

Please provide a structured JSON response with:
1. overview: A 2-3 sentence summary of the job
2. totalVacancy: Number of posts
3. salary: Salary/pay scale details
4. eligibility: {education, age, experience}
5. importantDates: {notificationDate, applicationStart, lastDate, examDate, resultDate}
6. applicationFee: {general, scSt, paymentMode}
7. selectionProcess: Array of selection steps
8. howToApply: Array of application steps
9. additionalInfo: Any other relevant information

Return ONLY valid JSON, no markdown or extra text.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('Groq API error:', response.status)
      return null
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
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

  if (!RAPIDAPI_KEY || !GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'API keys not configured' },
      { status: 503 }
    )
  }

  try {
    // Step 1: Fetch from RapidAPI
    const rapidData = await fetchFromRapidAPI(jobId, RAPIDAPI_KEY)

    // Step 2: Search external sources
    const externalInfo = await searchExternalSources(title, org)

    // Step 3: Prepare basic data
    const basicData = {
      title: rapidData?.title || title,
      organization: rapidData?.organization || org,
      type: rapidData?.type || type,
      description: rapidData?.description || rapidData?.overview || '',
      ...rapidData,
    }

    // Step 4: Use Groq AI to analyze and structure
    const aiAnalysis = await analyzeWithGroqAI(basicData, externalInfo, GROQ_API_KEY)

    // Step 5: Merge and normalize
    const detail = {
      id: jobId,
      title: aiAnalysis?.title || basicData.title,
      organization: aiAnalysis?.organization || basicData.organization,
      type: aiAnalysis?.type || basicData.type,
      overview: aiAnalysis?.overview || basicData.description || '',
      
      totalVacancy: aiAnalysis?.totalVacancy || rapidData?.totalVacancy || rapidData?.vacancy || '',
      salary: aiAnalysis?.salary || rapidData?.salary || rapidData?.salaryText || '',
      officialWebsite: rapidData?.officialWebsite || rapidData?.website || rapidData?.link || '',
      
      eligibility: {
        education: aiAnalysis?.eligibility?.education || rapidData?.qualification || '',
        age: aiAnalysis?.eligibility?.age || rapidData?.ageLimit || '',
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
        general: aiAnalysis?.applicationFee?.general || rapidData?.fee?.general || '',
        scSt: aiAnalysis?.applicationFee?.scSt || rapidData?.fee?.scSt || '',
        paymentMode: aiAnalysis?.applicationFee?.paymentMode || rapidData?.fee?.paymentMode || '',
      },
      
      selectionProcess: aiAnalysis?.selectionProcess || rapidData?.selectionProcess || [],
      howToApply: aiAnalysis?.howToApply || rapidData?.howToApply || [],
      additionalInfo: aiAnalysis?.additionalInfo || rapidData?.notes || '',
    }

    // Cache the result
    cache[cacheKey] = { data: detail, ts: Date.now() }

    return NextResponse.json(
      { detail, cached: false, aiEnhanced: !!aiAnalysis },
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
    
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
