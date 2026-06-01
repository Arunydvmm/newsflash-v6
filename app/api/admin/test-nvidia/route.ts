import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.NVIDIA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'NVIDIA_API_KEY not configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
        messages: [{ role: 'user', content: 'Say hello' }],
        temperature: 0.6,
        max_tokens: 100,
        stream: false
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      return NextResponse.json({
        status: 'failed',
        statusCode: res.status,
        error: errBody.error?.message ?? `HTTP ${res.status}`,
        fullError: errBody
      }, { status: res.status })
    }

    const body = await res.json()
    return NextResponse.json({
      status: 'success',
      message: body.choices[0].message.content,
      tokensUsed: body.usage?.total_tokens ?? 0
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
