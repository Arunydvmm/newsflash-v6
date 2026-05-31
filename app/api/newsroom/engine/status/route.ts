import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KEY_SHARING_MAP } from '@/lib/newsroom/agent-keys.config'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.nfSystemConfig.findFirst()
  const slots = await prisma.nfPipelineSlot.findMany({ orderBy: { slotNumber: 'asc' } })
  
  // Get current jobs for each slot
  const slotDetails = await Promise.all(
    slots.map(async (slot) => {
      if (slot.status === 'IDLE' || !slot.currentJobId) {
        return {
          slotNumber: slot.slotNumber,
          status: slot.status,
          currentJob: null
        }
      }

      const job = await prisma.nfPipelineJob.findUnique({
        where: { id: slot.currentJobId },
        include: { watchlist: true }
      })

      if (!job) {
        return {
          slotNumber: slot.slotNumber,
          status: 'IDLE',
          currentJob: null
        }
      }

      const elapsedSeconds = job.startedAt ? Math.floor((Date.now() - job.startedAt.getTime()) / 1000) : 0
      const agentReports = job.agentReports as Record<string, any> || {}
      const sleepLog = job.sleepLog as any[] || []

      return {
        slotNumber: slot.slotNumber,
        status: slot.status,
        currentJob: {
          id: job.id,
          headline: job.watchlist?.headline || '',
          source: job.watchlist?.sourceName || '',
          addedAt: job.createdAt?.toISOString(),
          currentStage: job.currentStage,
          currentAgent: job.currentAgent,
          stageStatuses: job.stageStatuses,
          startedAt: job.startedAt?.toISOString(),
          elapsedSeconds,
          sleepLog
        }
      }
    })
  )

  // Queue stats
  const queueStats = await prisma.nfPipelineJob.groupBy({
    by: ['status'],
    _count: true
  })

  const queue = {
    queued: queueStats.find(s => s.status === 'QUEUED')?._count || 0,
    running: queueStats.find(s => s.status === 'RUNNING')?._count || 0,
    completed: queueStats.find(s => s.status === 'COMPLETED')?._count || 0,
    failed: queueStats.find(s => s.status === 'FAILED')?._count || 0,
    held: queueStats.find(s => s.status === 'HELD')?._count || 0
  }

  // Sleeping agents
  const sleepStatuses = config?.agentSleepStatuses ? JSON.parse(config.agentSleepStatuses as string) : {}
  const sleepingAgents = Object.values(sleepStatuses).map((status: any) => ({
    jobId: status.jobId,
    agentName: status.agentName,
    reason: status.reason,
    sleepStarted: status.sleepStarted,
    wakeAt: status.wakeAt,
    secondsRemaining: Math.max(0, Math.floor((status.wakeAt - Date.now()) / 1000))
  }))

  // Key health
  const cooldowns = config?.keyCooldowns ? JSON.parse(config.keyCooldowns as string) : {}
  const keyHealth: Record<string, any> = {}

  for (const [envKey, assignedAgents] of Object.entries(KEY_SHARING_MAP)) {
    const isConfigured = !!process.env[envKey]
    const cooldownUntil = cooldowns[envKey] || 0
    const isCooling = cooldownUntil > Date.now()
    const cooldownRemaining = isCooling ? Math.floor((cooldownUntil - Date.now()) / 1000) : 0

    keyHealth[envKey] = {
      configured: isConfigured,
      cooling: isCooling,
      cooldownRemainingSeconds: cooldownRemaining,
      sharedBy: assignedAgents
    }
  }

  // Today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayJobs = await prisma.nfPipelineJob.findMany({
    where: { createdAt: { gte: today } },
    select: { status: true, startedAt: true, completedAt: true }
  })

  const todayStats = {
    completed: todayJobs.filter(j => j.status === 'COMPLETED').length,
    failed: todayJobs.filter(j => j.status === 'FAILED').length,
    held: todayJobs.filter(j => j.status === 'HELD').length,
    avgProcessingTimeSeconds: 0
  }

  const completedToday = todayJobs.filter(j => j.status === 'COMPLETED' && j.startedAt && j.completedAt)
  if (completedToday.length > 0) {
    const totalTime = completedToday.reduce((sum, j) => sum + (j.completedAt!.getTime() - j.startedAt!.getTime()), 0)
    todayStats.avgProcessingTimeSeconds = Math.floor(totalTime / completedToday.length / 1000)
  }

  return NextResponse.json({
    engineStopped: config?.engineStopped || false,
    engineStoppedBy: config?.engineStoppedBy || null,
    slots: slotDetails,
    queue,
    sleepingAgents,
    keyHealth,
    todayStats
  })
}
