import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.nfSystemConfig.upsert({
    where: { id: 'default' },
    update: { engineStopped: false, engineStoppedAt: null, engineStoppedBy: null },
    create: { id: 'default', engineStopped: false }
  })

  return NextResponse.json({ message: 'Engine resumed. Trigger pipeline to start processing.' })
}
