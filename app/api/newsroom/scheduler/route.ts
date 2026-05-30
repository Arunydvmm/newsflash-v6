import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-scheduler-secret')
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Call pipeline route internally
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/newsroom/pipeline`, {
      method: 'POST',
      headers: {
        'x-scheduler-secret': process.env.SCHEDULER_SECRET || ''
      }
    })

    const data = await response.json()

    return NextResponse.json({
      processed: data.triggered,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Scheduler error:', error)
    return NextResponse.json({ error: 'Failed to run scheduler' }, { status: 500 })
  }
}
