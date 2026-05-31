import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (body.confirm !== 'CONFIRM') {
    return NextResponse.json({ error: 'Must confirm with "CONFIRM"' }, { status: 400 })
  }

  // Delete pipeline jobs
  await prisma.nfPipelineJob.deleteMany({})

  // Reset pipeline slots
  await prisma.nfPipelineSlot.deleteMany({})
  for (let i = 1; i <= 3; i++) {
    await prisma.nfPipelineSlot.create({
      data: { slotNumber: i, status: 'IDLE' }
    })
  }

  // Delete watchlist
  await prisma.nfWatchlist.deleteMany({})

  // Reset system config cooldowns and sleep statuses
  await prisma.nfSystemConfig.upsert({
    where: { id: 'default' },
    update: {
      keyCooldowns: null,
      agentSleepStatuses: null,
      engineStopped: false,
      engineStoppedAt: null,
      engineStoppedBy: null
    },
    create: {
      id: 'default',
      keyCooldowns: null,
      agentSleepStatuses: null,
      engineStopped: false
    }
  })

  return NextResponse.json({ message: 'Pipeline data wiped. Published articles preserved.' })
}
