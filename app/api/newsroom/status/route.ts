import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [draftsReady, publishedToday, blocked, pipelineRunning, total] = await Promise.all([
      prisma.nfArticle.count({ where: { pipelineStatus: 'DRAFT_READY' } }),
      prisma.nfArticle.count({ 
        where: { 
          pipelineStatus: 'PUBLISHED',
          reviewedAt: { gte: today }
        }
      }),
      prisma.nfArticle.count({ where: { pipelineStatus: 'BLOCKED' } }),
      prisma.nfArticle.count({ 
        where: { 
          pipelineStatus: { 
            notIn: ['DRAFT_READY', 'BLOCKED', 'PUBLISHED', 'REJECTED', 'APPROVED'] 
          }
        }
      }),
      prisma.nfArticle.count({ where: { pipelineStatus: 'PUBLISHED' } })
    ])

    return NextResponse.json({ 
      draftsReady, 
      publishedToday, 
      blocked, 
      pipelineRunning,
      total 
    })
  } catch (error) {
    console.error('Status error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
