import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Get all stage logs grouped by stage name
    const stageLogs = await prisma.nfStageLog.groupBy({
      by: ['stageName'],
      _count: { id: true },
      _avg: {
        confidence: true,
        tokensUsed: true,
        processingMs: true
      },
      _sum: {
        tokensUsed: true,
        processingMs: true
      },
      orderBy: {
        stageName: 'asc'
      }
    })

    // Get recent logs for each stage (last 10)
    const recentLogs = await prisma.nfStageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            pipelineStatus: true
          }
        }
      }
    })

    // Group recent logs by stage
    const recentByStage = recentLogs.reduce((acc, log) => {
      if (!acc[log.stageName]) {
        acc[log.stageName] = []
      }
      acc[log.stageName].push(log)
      return acc
    }, {} as Record<string, any[]>)

    // Calculate success rate (completed vs blocked)
    const totalArticles = await prisma.nfArticle.count()
    const publishedArticles = await prisma.nfArticle.count({
      where: { pipelineStatus: 'PUBLISHED' }
    })
    const blockedArticles = await prisma.nfArticle.count({
      where: { pipelineStatus: 'BLOCKED' }
    })
    const draftReadyArticles = await prisma.nfArticle.count({
      where: { pipelineStatus: 'DRAFT_READY' }
    })

    const agentStats = stageLogs.map(stage => ({
      stage: stage.stageName,
      totalRuns: stage._count.id,
      avgConfidence: stage._avg.confidence || 0,
      avgTokens: Math.round(stage._avg.tokensUsed || 0),
      avgProcessingTime: Math.round(stage._avg.processingMs || 0),
      totalTokens: stage._sum.tokensUsed || 0,
      totalProcessingTime: stage._sum.processingMs || 0,
      recentLogs: (recentByStage[stage.stageName] || []).slice(0, 10)
    }))

    return NextResponse.json({
      agentStats,
      overview: {
        totalArticles,
        publishedArticles,
        blockedArticles,
        draftReadyArticles,
        successRate: totalArticles > 0 ? ((publishedArticles / totalArticles) * 100).toFixed(1) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching agent stats:', error)
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 })
  }
}
