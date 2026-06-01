import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Check admin auth (you can add your own auth logic here)
  // For now, we'll just call the scheduler with the secret from env
  
  try {
    const schedulerSecret = process.env.SCHEDULER_SECRET
    if (!schedulerSecret) {
      return NextResponse.json({ error: 'Scheduler secret not configured' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const res = await fetch(`${siteUrl}/api/newsroom/scheduler`, {
      method: 'POST',
      headers: {
        'x-scheduler-secret': schedulerSecret
      }
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json(error, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Trigger scheduler error:', error)
    return NextResponse.json({ error: 'Failed to trigger scheduler' }, { status: 500 })
  }
}
