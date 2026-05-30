import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, reason } = await req.json()
    const articleId = params.id

    if (action === 'stop') {
      // Stop processing - mark as blocked
      await prisma.nfArticle.update({
        where: { id: articleId },
        data: {
          pipelineStatus: 'BLOCKED',
          blockReason: reason || 'Manually stopped by admin',
          humanDecision: 'STOP',
          humanNotes: reason || 'Manually stopped by admin',
          reviewedBy: auth.username,
          reviewedAt: new Date()
        }
      })

      // Also update workflow if exists
      await prisma.nfWorkflow.updateMany({
        where: { articleId },
        data: {
          status: 'BLOCKED',
          error: reason || 'Manually stopped by admin',
          completedAt: new Date()
        }
      })

      // Log to audit
      await prisma.nfAuditLog.create({
        data: {
          articleId,
          action: 'STOP',
          performedBy: auth.username,
          reason: reason || 'Manually stopped by admin',
          metadata: { manualIntervention: true }
        }
      })

      return NextResponse.json({ success: true, message: 'Article processing stopped' })
    }

    if (action === 'delete') {
      // Delete article and related records
      await prisma.nfAuditLog.deleteMany({ where: { articleId } })
      await prisma.nfContentLog.deleteMany({ where: { articleId } })
      await prisma.nfStageLog.deleteMany({ where: { articleId } })
      await prisma.nfSummaryReport.deleteMany({ where: { articleId } })
      await prisma.nfWorkflow.deleteMany({ where: { articleId } })
      await prisma.nfArticle.delete({ where: { id: articleId } })

      return NextResponse.json({ success: true, message: 'Article deleted' })
    }

    if (action === 'suggest_edit') {
      // Add edit suggestion to article
      const { suggestion } = await req.json()
      
      await prisma.nfArticle.update({
        where: { id: articleId },
        data: {
          humanNotes: suggestion,
          reviewedBy: auth.username,
          reviewedAt: new Date()
        }
      })

      // Log to audit
      await prisma.nfAuditLog.create({
        data: {
          articleId,
          action: 'EDIT_SUGGESTION',
          performedBy: auth.username,
          reason: 'Edit suggestion provided',
          metadata: { suggestion }
        }
      })

      return NextResponse.json({ success: true, message: 'Edit suggestion added' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error controlling article:', error)
    return NextResponse.json({ error: 'Failed to control article' }, { status: 500 })
  }
}
