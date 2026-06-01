import { PrismaClient } from '@prisma/client'
import { callAgent } from './agent-caller'
import { scoutAgent }   from './agents/agent1-scout'
import { extractAgent } from './agents/agent2-extract'
import { writeAgent }   from './agents/agent3-write'
import { reviewAgent }  from './agents/agent4-review'
import { chiefAgent }   from './agents/agent5-chief'

const prisma = new PrismaClient()

export interface AgentStageResult {
  modifiedContent?: string
  stageReport: any
  confidence: number
  recommendation: 'PROCEED' | 'ESCALATE' | 'REWRITE' | 'BLOCK'
  blockReason?: string
  providerUsed: string
  modelUsed: string
  usedKey: 'primary' | 'backup' | 'fallback' | 'retry_after_sleep'
  tokensUsed: number
  processingMs: number
  sleepOccurred: boolean
  sleepDurationMs: number
}

// HARDCODED — never change these values
const MAX_SLOTS = 1              // only 1 article processes at a time
const MAX_ARTICLES_PER_DAY = 1   // reduced to 1 to stay within token budget
const SLOT_DELAY = 0             // no delay needed — only 1 slot

// Check if a new job can be started
export async function canStartNewJob(): Promise<{ allowed: boolean; reason: string }> {
  // Check 1: is another job already running?
  const running = await prisma.nfPipelineJob.count({
    where: { status: 'RUNNING' }
  })
  if (running > 0) {
    return { allowed: false, reason: 'Another article is already processing. Wait for it to finish.' }
  }

  // Check 2: have we already completed 5 articles today?
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const completedToday = await prisma.nfPipelineJob.count({
    where: { status: 'COMPLETED', completedAt: { gte: todayStart } }
  })
  if (completedToday >= MAX_ARTICLES_PER_DAY) {
    return { allowed: false, reason: `Daily limit reached (${completedToday}/${MAX_ARTICLES_PER_DAY}). Resets at midnight IST.` }
  }

  // Check 3: is engine manually stopped?
  const config = await prisma.nfSystemConfig.findFirst()
  if (config?.engineStopped) {
    return { allowed: false, reason: 'Engine manually stopped by admin.' }
  }

  return { allowed: true, reason: '' }
}

const STAGES = [
  { name: 'SCOUT',   fn: scoutAgent,   maxTokens: 800,  delayAfter: 5000  },
  { name: 'EXTRACT', fn: extractAgent, maxTokens: 700,  delayAfter: 6000  },
  { name: 'WRITE',   fn: writeAgent,   maxTokens: 3000, delayAfter: 8000  },
  { name: 'REVIEW',  fn: reviewAgent,  maxTokens: 1000, delayAfter: 5000  },
  { name: 'CHIEF',   fn: chiefAgent,   maxTokens: 800,  delayAfter: 0     }
]

// Token math per article:
// SCOUT:   800  → Groq KEY_1
// EXTRACT: 700  → Groq KEY_2
// WRITE:   3000 → OpenRouter (zero Groq tokens)
// REVIEW:  1000 → OpenRouter (zero Groq tokens)
// CHIEF:   800  → Nvidia     (zero Groq tokens)
// ──────────────────────────────────
// Groq KEY_1: 800  × 5 = 4,000  / 100,000 → 4%  ✅
// Groq KEY_2: 700  × 5 = 3,500  / 100,000 → 3.5%✅
// OpenRouter: 4000 × 5 = 20,000 free       → fine✅
// Nvidia:     800  × 5 = 4,000  free tier  → fine✅
// ──────────────────────────────────
// Total daily: 7,500 Groq tokens — 92,500 token buffer remaining
// Pipeline will NEVER hit quota at 5 articles/day

export async function initSlots() {
  for (let i = 1; i <= MAX_SLOTS; i++) {
    await prisma.nfPipelineSlot.upsert({
      where: { slotNumber: i },
      update: {},
      create: { slotNumber: i, status: 'IDLE' }
    })
  }
}

export async function getAvailableSlot(): Promise<number | null> {
  const slot = await prisma.nfPipelineSlot.findFirst({
    where: { status: 'IDLE' },
    orderBy: { slotNumber: 'asc' }
  })
  return slot?.slotNumber ?? null
}

export async function occupySlot(slotNumber: number, jobId: string) {
  await prisma.nfPipelineSlot.update({
    where: { slotNumber },
    data: { status: 'BUSY', currentJobId: jobId, startedAt: new Date() }
  })
}

export async function freeSlot(slotNumber: number) {
  await prisma.nfPipelineSlot.update({
    where: { slotNumber },
    data: { status: 'IDLE', currentJobId: null, startedAt: null }
  })
}

export async function addToQueue(watchlistId: string) {
  const count = await prisma.nfPipelineJob.count({ where: { status: 'QUEUED' } })
  return prisma.nfPipelineJob.create({
    data: { watchlistId, status: 'QUEUED', queuePosition: count + 1, stageStatuses: {}, agentReports: {}, sleepLog: [] }
  })
}

export async function getNextQueuedJob() {
  return prisma.nfPipelineJob.findFirst({
    where: { status: 'QUEUED' },
    orderBy: { queuePosition: 'asc' },
    include: { watchlist: true }
  })
}

export async function runPipelineJob(job: any, slotNumber: number) {
  try {
    // Delayed start per slot
    const delay = SLOT_DELAY
    if (delay > 0) await new Promise(r => setTimeout(r, delay))

    console.log(`[Pipeline] Starting job ${job.id} on slot ${slotNumber}`)

    await prisma.nfPipelineJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', slotNumber, startedAt: new Date() }
    })

    let currentContent = job.watchlist?.contentSnippet ?? ''
    let accumulatedReports: Record<string, any> = {}
    let sleepLog: any[] = []

    for (const stage of STAGES) {
      // Update current stage visible on admin panel
      try {
        await prisma.nfPipelineJob.update({
          where: { id: job.id },
          data: {
            currentStage: stage.name,
            currentAgent: `${stage.name} (Slot ${slotNumber})`,
            stageStatuses: { ...accumulatedReports, [stage.name]: 'RUNNING' }
          }
        })
      } catch (err: any) {
        if (err.code === 'P2025') {
          console.error(`[Pipeline] Job ${job.id} not found - aborting pipeline`)
          return
        }
        throw err
      }

      try {
        console.log(`[Pipeline] Running stage ${stage.name} for job ${job.id}`)
        
        const result = await stage.fn({
          jobId: job.id,
          currentContent,
          allPreviousReports: accumulatedReports,
          sourceData: job.watchlist,
          metadata: {
            title: job.watchlist?.headline ?? '',
            region: job.watchlist?.region ?? 'India',
            priority: job.watchlist?.priority ?? 'STANDARD'
          }
        }) as AgentStageResult

        if (!result) {
          throw new Error(`Stage ${stage.name} returned undefined result`)
        }

        console.log(`[Pipeline] Stage ${stage.name} completed for job ${job.id}`, {
          recommendation: result.recommendation,
          confidence: result.confidence,
          hasModifiedContent: !!result.modifiedContent,
          hasStageReport: !!result.stageReport
        })

      // Track sleep events
      if (result.sleepOccurred) {
        sleepLog.push({
          stage: stage.name,
          sleepDurationMs: result.sleepDurationMs,
          reason: 'All API keys failed — slept and retried',
          timestamp: new Date().toISOString()
        })
      }

      accumulatedReports[stage.name] = {
        status: 'DONE',
        confidence: result.confidence,
        recommendation: result.recommendation,
        report: result.stageReport,
        providerUsed: result.providerUsed,
        modelUsed: result.modelUsed,
        usedKey: result.usedKey,
        tokensUsed: result.tokensUsed,
        processingMs: result.processingMs,
        sleepOccurred: result.sleepOccurred ?? false
      }

      await prisma.nfPipelineJob.update({
        where: { id: job.id },
        data: { agentReports: accumulatedReports, sleepLog }
      }).catch((err: any) => {
        if (err.code === 'P2025') {
          console.error(`[Pipeline] Job ${job.id} not found during stage update - aborting`)
          throw new Error(`Job disappeared during ${stage.name} stage`)
        }
        throw err
      })

      // Handle recommendations
      if (result.recommendation === 'BLOCK') {
        return await endJob(job.id, slotNumber, 'FAILED', `Blocked at ${stage.name}: ${result.blockReason ?? 'Safety check failed'}`)
      }
      if (result.recommendation === 'REWRITE') {
        return await endJob(job.id, slotNumber, 'HELD', `Held for rewrite at ${stage.name}`)
      }

      if (result.modifiedContent) currentContent = result.modifiedContent

      // Stage delay to prevent API bursts
      if (stage.delayAfter > 0) await new Promise(r => setTimeout(r, stage.delayAfter))

    } catch (error: any) {
      // Log but DO NOT crash — mark stage failed and continue to next
      // EXCEPT for WRITE and CHIEF — those are critical, fail the job
      const criticalStages = ['WRITE', 'CHIEF']
      
      console.error(`[Pipeline] Stage ${stage.name} failed:`, {
        jobId: job.id,
        error: error.message,
        stack: error.stack
      })
      
      accumulatedReports[stage.name] = { 
        status: 'FAILED_SAFE', 
        error: error.message,
        recommendation: 'PROCEED', // continue despite failure
        confidence: 0.5
      }
      
      await prisma.nfPipelineJob.update({
        where: { id: job.id },
        data: { agentReports: accumulatedReports, sleepLog }
      })

      if (criticalStages.includes(stage.name)) {
        console.error(`[Pipeline] Critical stage ${stage.name} failed for job ${job.id}`)
        return await endJob(job.id, slotNumber, 'FAILED', `Critical stage ${stage.name} failed: ${error.message}`)
      }

      console.warn(`Stage ${stage.name} failed safely — continuing pipeline: ${error.message}`)
    }
  }

  // All stages passed — save article
  await saveArticleFromJob(job, accumulatedReports)
  await prisma.nfPipelineJob.update({
    where: { id: job.id },
    data: { status: 'COMPLETED', completedAt: new Date(), currentStage: null, currentAgent: null }
  })
  await freeSlot(slotNumber)
  await triggerNextJob(slotNumber)
  } catch (error: any) {
    console.error(`[Pipeline] Unhandled error in job ${job.id}:`, {
      error: error.message,
      stack: error.stack
    })
    await endJob(job.id, slotNumber, 'FAILED', `Unhandled error: ${error.message}`)
  }
}

async function endJob(jobId: string, slotNumber: number, status: string, reason: string) {
  await prisma.nfPipelineJob.update({
    where: { id: jobId },
    data: { status, failedAt: new Date(), failReason: reason, currentStage: null, currentAgent: null }
  })
  await freeSlot(slotNumber)
  await triggerNextJob(slotNumber)
}

async function triggerNextJob(slotNumber: number) {
  const check = await canStartNewJob()
  if (!check.allowed) return

  const nextJob = await getNextQueuedJob()
  if (!nextJob) return

  // 10 second pause between articles — lets APIs breathe
  await new Promise(r => setTimeout(r, 10000))

  await prisma.nfPipelineSlot.update({
    where:  { slotNumber },
    data:   { status: 'BUSY', currentJobId: nextJob.id, startedAt: new Date() }
  })
  runPipelineJob(nextJob, slotNumber) // fire and forget
}

async function saveArticleFromJob(job: any, reports: Record<string, any>) {
  const chiefReport = reports['CHIEF']?.report
  const reviewReport = reports['REVIEW']?.report
  const writeReport = reports['WRITE']?.report

  if (!chiefReport || chiefReport.editorialGrade === 'REJECT') return
  if (!['A', 'B'].includes(chiefReport.editorialGrade)) return

  const article = await prisma.nfArticle.create({
    data: {
      title:           writeReport?.article?.headline   ?? job.watchlist.headline,
      slug:            reviewReport?.seo?.slug          ?? job.watchlist.headline.toLowerCase().replace(/\s+/g, '-').slice(0, 60),
      content:         writeReport?.article?.body       ?? '',
      excerpt:         reviewReport?.seo?.metaDescription ?? '',
      metaTitle:       reviewReport?.seo?.metaTitle     ?? '',
      metaDescription: reviewReport?.seo?.metaDescription ?? '',
      tags:            chiefReport?.finalTags           ?? [],
      category:        chiefReport?.finalCategory       ?? job.watchlist.category ?? 'General',
      sourceUrl:       job.watchlist.sourceUrl,
      sourceName:      job.watchlist.sourceName,
      pipelineStatus:  chiefReport.decision === 'PUBLISH_NOW' ? 'APPROVED' : 'DRAFT_READY',
      contentOrigin:   'AI_GENERATED',
      editorialGrade:  chiefReport.editorialGrade,
      overallScore:    chiefReport.overallScore
    }
  })

  await prisma.nfPipelineJob.update({
    where: { id: job.id },
    data: { articleId: article.id }
  })
}
