import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.nfSystemConfig.upsert({
    where: { id: 'default' },
    update: { engineStopped: true, engineStoppedAt: new Date(), engineStoppedBy: auth.username },
    create: { id: 'default', engineStopped: true, engineStoppedAt: new Date(), engineStoppedBy: auth.username }
  })

  return NextResponse.json({
    message: 'Engine stop requested. Running jobs will finish gracefully. No new jobs will start.'
  })
}
