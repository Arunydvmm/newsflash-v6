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
    console.log('Fetching drafts with pipelineStatus: DRAFT_READY')
    const drafts = await prisma.nfArticle.findMany({
      where: {
        pipelineStatus: 'DRAFT_READY'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    console.log(`Drafts API: Found ${drafts.length} articles with DRAFT_READY status`)
    
    // Also check what statuses exist
    const allArticles = await prisma.nfArticle.findMany({
      select: { pipelineStatus: true },
      take: 10
    })
    console.log('Sample article statuses:', allArticles.map(a => a.pipelineStatus))

    return NextResponse.json({ drafts, count: drafts.length })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
}
