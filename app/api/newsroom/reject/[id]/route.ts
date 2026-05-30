import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reason } = await req.json()

  try {
    await prisma.nfArticle.update({
      where: { id: params.id },
      data: {
        pipelineStatus: 'REJECTED',
        humanDecision: 'REJECTED',
        humanNotes: reason || 'Rejected by editor',
        reviewedBy: auth.username,
        reviewedAt: new Date()
      }
    })

    // Log to audit
    await prisma.nfAuditLog.create({
      data: {
        articleId: params.id,
        action: 'REJECT',
        performedBy: auth.username,
        reason: reason || 'Rejected by editor'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reject error:', error)
    return NextResponse.json({ error: 'Failed to reject article' }, { status: 500 })
  }
}
