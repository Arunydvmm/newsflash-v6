// @ts-nocheck
// Groq AI — Sarkari job/result detail enrichment
// Uses LLaMA via Groq to research and return structured details
// API key NEVER sent to frontend
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile' // Current Groq model (replaces decommissioned llama3-70b-8192)

// Cache to avoid repeated API calls for same item
const cache: Record<string, { data: any; ts: number }> = {}
const CACHE_TTL = 5 * 60 * 60 * 1000 // 5 hours

export async function POST(req: NextRequest) {
  const API_KEY = process.env.GROQ_API_KEY
  if (!API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 })
  }

  const body = await req.json()
  const { title, org, type, date, extra } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const cacheKey = `${title}_${org}_${type}`.toLowerCase().replace(/\s+/g, '_').slice(0, 100)
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return NextResponse.json(cache[cacheKey].data, { headers: { 'X-Cache': 'HIT' } })
  }

  const typeLabel = {
    jobs:         'government job notification',
    results:      'exam result',
    'admit-card': 'admit card',
    'answer-key': 'answer key',
  }[type] || 'sarkari notification'

  const prompt = `You are an expert on Indian government jobs and sarkari notifications with access to current recruitment information.
A user wants comprehensive details about this ${typeLabel}:

Title: ${title}
Organisation: ${org || 'Not specified'}
${extra ? `Posts/Vacancies: ${extra}` : ''}
${date ? `Date: ${date}` : ''}

IMPORTANT: Do deep research using your knowledge of:
- Official government recruitment portals (SSC, UPSC, Railway, Bank, Police websites)
- Common eligibility criteria for similar positions
- Typical selection processes for government jobs
- Standard application procedures
- Current salary scales and pay commissions

Provide comprehensive, well-researched details in this EXACT JSON format (no markdown, just raw JSON):

{
  "overview": "2-3 sentence summary of what this notification is about and its significance",
  "organisation": "Full official name of the organisation",
  "postName": "Name of the post(s) being recruited",
  "totalVacancy": "Total number of vacancies",
  "eligibility": {
    "education": "Educational qualification required (e.g., Bachelor's degree, 12th pass)",
    "age": "Age limit (min-max years) with relaxation for SC/ST/OBC if applicable",
    "experience": "Years of experience required if any",
    "nationality": "Nationality requirement"
  },
  "salary": "Pay scale or salary range with grade pay if applicable",
  "importantDates": {
    "notificationDate": "When notification was released",
    "applicationStart": "Application start date",
    "lastDate": "Last date to apply",
    "examDate": "Exam date if known",
    "resultDate": "Result date if known"
  },
  "selectionProcess": ["Written exam", "Interview", "Document verification", "Medical test"],
  "applicationFee": {
    "general": "Fee for General/OBC candidates",
    "scSt": "Fee for SC/ST/PH candidates",
    "paymentMode": "Online/Offline/Both"
  },
  "howToApply": ["Visit official website", "Register and fill application form", "Upload documents", "Pay application fee", "Submit application"],
  "officialWebsite": "Official website URL",
  "importantLinks": {
    "notification": "PDF notification link",
    "applyOnline": "Online application link",
    "officialSite": "Official website"
  },
  "additionalInfo": "Important information like document requirements, exam pattern, negative marking, etc.",
  "disclaimer": "Information based on AI research, always verify from official sources before applying"
}

If specific details are not available, use "Check official notification" as the value. Always respond with valid JSON only, no markdown formatting.`

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert on Indian government jobs. Always respond with valid JSON only, no markdown formatting, no code blocks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq API error:', res.status, err)
      return NextResponse.json({ error: `AI service error: ${res.status}` }, { status: 502 })
    }

    const groqData = await res.json()
    const content  = groqData?.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    let details: any = {}
    try {
      // Strip any accidental markdown code blocks
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      details = JSON.parse(cleaned)
    } catch {
      // If JSON parse fails, return raw content
      details = { overview: content, disclaimer: 'Raw AI response — could not parse structured data' }
    }

    const result = { details, model: MODEL, cached: false }
    cache[cacheKey] = { data: result, ts: Date.now() }

    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch (err: any) {
    console.error('AI detail error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
