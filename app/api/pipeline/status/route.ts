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
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Get recent stage logs
    const recentStageLogs = await prisma.nfStageLog.findMany({
      orderBy: { startTime: 'desc' },
      take: 50,
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

    // Get workflow status
    const workflows = await prisma.nfWorkflow.findMany({
      where: {
        status: {
          in: ['MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 
                'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR']
        }
      },
      orderBy: { id: 'desc' },
      take: 10,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            currentStage: true
          }
        }
      }
    })

    const stages = ['MONITORING', 'RESEARCH', 'EXTRACTION', 'FACT_CHECK', 'JUNIOR_DRAFT', 
                   'SENIOR_EDIT', 'BIAS_REVIEW', 'LEGAL_REVIEW', 'COPYRIGHT_REVIEW', 'SEO_REVIEW', 'CHIEF_EDITOR']

    const stageStatuses = stages.map(stage => {
      const stageLogs = recentStageLogs.filter(log => log.stageName === stage)
      const latestLog = stageLogs[0]
      
      return {
        name: stage,
        status: latestLog ? (latestLog.stageStatus === 'COMPLETED' ? 'done' : 'running') : 'idle',
        lastArticle: latestLog?.article?.title || null,
        lastTimestamp: latestLog?.startTime || null
      }
    })

    return NextResponse.json({
      processingArticles,
      recentStageLogs,
      workflows,
      stageStatuses,
      isRunning: processingArticles.length > 0
    })
  } catch (error) {
    console.error('Error fetching pipeline status:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline status' }, { status: 500 })
  }
}
