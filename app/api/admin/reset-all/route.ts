import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // WIPE ALL PIPELINE DATA - COMPLETE RESET FOR TESTING
    console.log('🔴 COMPLETE RESET: Wiping all pipeline data...')

    // Delete all pipeline jobs
    const deletedJobs = await prisma.nfPipelineJob.deleteMany({})
    console.log(`Deleted ${deletedJobs.count} pipeline jobs`)

    // Delete all pipeline slots
    const deletedSlots = await prisma.nfPipelineSlot.deleteMany({})
    console.log(`Deleted ${deletedSlots.count} pipeline slots`)

    // Reset system config - clear ALL counters
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const config = await prisma.nfSystemConfig.upsert({
      where: { id: 'default' },
      update: {
        groqTokensToday: 0,
        googleTokensToday: 0,
        mistralTokensToday: 0,
        tokenResetDate: today,
        engineStopped: false,
        engineStoppedAt: null,
        engineStoppedBy: null,
        keyCooldowns: '{}',
        rateLimitTimestamps: '{}',
        agentSleepStatuses: '{}'
      },
      create: {
        id: 'default',
        groqTokensToday: 0,
        googleTokensToday: 0,
        mistralTokensToday: 0,
        tokenResetDate: today
      }
    })
    console.log('Reset system config')

    // Re-initialize slots
    for (let i = 1; i <= 1; i++) {
      await prisma.nfPipelineSlot.upsert({
        where: { slotNumber: i },
        update: { status: 'IDLE', currentJobId: null, startedAt: null },
        create: { slotNumber: i, status: 'IDLE' }
      })
    }
    console.log('Reinitialized pipeline slots')

    return NextResponse.json({
      success: true,
      message: '✅ COMPLETE RESET DONE - All pipeline data cleared, tokens reset to 0',
      cleared: {
        pipelineJobs: deletedJobs.count,
        pipelineSlots: deletedSlots.count,
        systemConfig: 'Reset',
        tokenCounters: { groq: 0, google: 0, mistral: 0 },
        sleepStatus: 'Cleared',
        rateLimits: 'Cleared',
        engineStatus: 'Ready'
      }
    })
  } catch (error: any) {
    console.error('Error in complete reset:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
