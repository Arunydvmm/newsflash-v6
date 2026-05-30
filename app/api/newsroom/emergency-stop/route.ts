import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get or create system config
    let config = await prisma.nfSystemConfig.findFirst()
    if (!config) {
      config = await prisma.nfSystemConfig.create({
        data: { emergencyStop: true, lastUpdatedBy: auth.username, lastUpdatedAt: new Date() }
      })
    } else {
      config = await prisma.nfSystemConfig.update({
        where: { id: config.id },
        data: { emergencyStop: true, lastUpdatedBy: auth.username, lastUpdatedAt: new Date() }
      })
    }

    // Log to audit
    await prisma.nfAuditLog.create({
      data: {
        articleId: null,
        action: 'EMERGENCY_STOP',
        performedBy: auth.username,
        reason: 'Emergency kill switch activated by admin',
        metadata: { userId: auth.username }
      }
    })

    return NextResponse.json({ success: true, emergencyStop: true })
  } catch (error) {
    console.error('Emergency stop error:', error)
    return NextResponse.json({ error: 'Failed to activate emergency stop' }, { status: 500 })
  }
}
