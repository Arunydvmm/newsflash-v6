import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-scheduler-secret')
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check for stuck pipelines
    const stuckWorkflows = await prisma.nfWorkflow.findMany({
      where: {
        status: { notIn: ['BLOCKED', 'DRAFT_READY', 'PUBLISHED', 'REJECTED'] as any },
        updatedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes ago
      }
    })

    for (const workflow of stuckWorkflows) {
      console.warn(`Stuck workflow detected: ${workflow.id}`)
      await prisma.nfAuditLog.create({
        data: {
          articleId: workflow.articleId,
          action: 'PIPELINE_STUCK',
          performedBy: 'SCHEDULER',
          reason: 'Pipeline stuck for >10 minutes',
          metadata: { workflowId: workflow.id }
        }
      })
    }

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
