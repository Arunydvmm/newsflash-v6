import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { initSlots, getAvailableSlot, getNextQueuedJob, occupySlot, runPipelineJob } from '@/lib/newsroom/pipeline-engine'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = getAuth()
  const schedulerSecret = req.headers.get('x-scheduler-secret')
  if (!auth?.role && schedulerSecret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = await prisma.nfSystemConfig.findFirst()
  if (config?.engineStopped) {
    return NextResponse.json({ message: 'Engine is manually stopped. Resume from admin panel.' })
  }

  await initSlots()
  let activated = 0

  for (let i = 0; i < 3; i++) {
    const slot = await getAvailableSlot()
    if (!slot) break
    const job = await getNextQueuedJob()
    if (!job) break
    await occupySlot(slot, job.id)
    runPipelineJob(job, slot) // non-blocking
    activated++
  }

  return NextResponse.json({ message: `Engine started. ${activated} slot(s) activated.`, activated })
}
