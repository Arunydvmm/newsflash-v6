import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { canStartNewJob, getNextQueuedJob, runPipelineJob } from '@/lib/newsroom/pipeline-engine'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-scheduler-secret')
  const auth   = getAuth()
  if (!auth?.role && secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const check = await canStartNewJob()
  if (!check.allowed) {
    return NextResponse.json({ started: false, reason: check.reason })
  }

  const nextJob = await getNextQueuedJob()
  if (!nextJob) {
    return NextResponse.json({ started: false, reason: 'No articles in queue' })
  }

  // Occupy slot 1 — only ever 1 slot
  await prisma.nfPipelineSlot.upsert({
    where:  { slotNumber: 1 },
    update: { status: 'BUSY', currentJobId: nextJob.id, startedAt: new Date() },
    create: { slotNumber: 1, status: 'BUSY', currentJobId: nextJob.id, startedAt: new Date() }
  })

  // Fire and forget — non-blocking
  runPipelineJob(nextJob, 1)

  return NextResponse.json({
    started: true,
    jobId:   nextJob.id,
    headline: nextJob.watchlist?.headline
  })
}
