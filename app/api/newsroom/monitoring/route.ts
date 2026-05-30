import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get currently processing articles
    const processingArticles = await prisma.nfArticle.findMany({
      where: {
        pipelineStatus: {
          in: ['MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 
                'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR']
        }
      },
      select: {
        id: true,
        title: true,
        currentStage: true,
        pipelineStatus: true,
        sourceName: true,
        createdAt: true,
        updatedAt: true,
        isGovernmentVerified: true,
        governmentSource: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Get blocked articles
    const blockedArticles = await prisma.nfArticle.findMany({
      where: { pipelineStatus: 'BLOCKED' },
      select: {
        id: true,
        title: true,
        blockReason: true,
        sourceName: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Get recent stage logs for activity
    const recentStageLogs = await prisma.nfStageLog.findMany({
      orderBy: { startTime: 'desc' },
      take: 20,
      select: {
        id: true,
        stageName: true,
        stageStatus: true,
        confidence: true,
        recommendation: true,
        startTime: true,
        article: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Get watchlist status
    const watchlistStats = await prisma.nfWatchlist.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const watchlistStatus = {
      pending: watchlistStats.find(s => s.status === 'PENDING')?._count.id || 0,
      processing: watchlistStats.find(s => s.status === 'PROCESSING')?._count.id || 0,
      completed: watchlistStats.find(s => s.status === 'COMPLETED')?._count.id || 0,
      failed: watchlistStats.find(s => s.status === 'FAILED')?._count.id || 0
    }

    return NextResponse.json({
      processingArticles,
      blockedArticles,
      recentActivity: recentStageLogs,
      watchlistStatus
    })
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 })
  }
}
