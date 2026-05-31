import { PrismaClient } from '@prisma/client'
import { callAgent } from './agent-caller'
import { monitorAgent }       from './agents/agent1-monitor'
import { researchAgent }      from './agents/agent2-research'
import { extractVerifyAgent } from './agents/agent3-extract-verify'
import { writeAgent }         from './agents/agent4-write'
import { safetyAgent }        from './agents/agent5-safety'
import { seoPolishAgent }     from './agents/agent6-seo-polish'
import { chiefEditorAgent }   from './agents/agent7-chiefeditor'

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
const MAX_ARTICLES_PER_DAY = 5   // stop after 5 completed articles per day
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
  { name: 'MONITOR',        fn: monitorAgent,       maxTokens: 500,  delayAfter: 5000  },
  { name: 'RESEARCH',       fn: researchAgent,      maxTokens: 800,  delayAfter: 8000  },
  { name: 'EXTRACT_VERIFY', fn: extractVerifyAgent, maxTokens: 800,  delayAfter: 8000  },
  { name: 'WRITE',          fn: writeAgent,         maxTokens: 2000, delayAfter: 10000 },
  { name: 'SAFETY',         fn: safetyAgent,        maxTokens: 800,  delayAfter: 8000  },
  { name: 'SEO_POLISH',     fn: seoPolishAgent,     maxTokens: 1500, delayAfter: 5000  },
  { name: 'CHIEF_EDITOR',   fn: chiefEditorAgent,   maxTokens: 800,  delayAfter: 0     }
]

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
  // Delayed start per slot
  const delay = SLOT_DELAY
  if (delay > 0) await new Promise(r => setTimeout(r, delay))

  await prisma.nfPipelineJob.update({
    where: { id: job.id },
    data: { status: 'RUNNING', slotNumber, startedAt: new Date() }
  })

  let currentContent = job.watchlist?.contentSnippet ?? ''
  let accumulatedReports: Record<string, any> = {}
  let sleepLog: any[] = []

  for (const stage of STAGES) {
    // Update current stage visible on admin panel
    await prisma.nfPipelineJob.update({
      where: { id: job.id },
      data: {
        currentStage: stage.name,
        currentAgent: `${stage.name} (Slot ${slotNumber})`,
        stageStatuses: { ...accumulatedReports, [stage.name]: 'RUNNING' }
      }
    })

    try {
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
      accumulatedReports[stage.name] = { status: 'FAILED', error: error.message }
      await prisma.nfPipelineJob.update({
        where: { id: job.id },
        data: { agentReports: accumulatedReports, sleepLog }
      })
      return await endJob(job.id, slotNumber, 'FAILED', `Stage ${stage.name} crashed: ${error.message}`)
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
  const chiefReport = reports['CHIEF_EDITOR']?.report
  const seoReport   = reports['SEO_POLISH']?.report
  const writeReport = reports['WRITE']?.report

  if (!chiefReport || chiefReport.editorialGrade === 'REJECT') return
  if (!['A', 'B'].includes(chiefReport.editorialGrade)) return

  const article = await prisma.nfArticle.create({
    data: {
      title:           writeReport?.article?.headline   ?? job.watchlist.headline,
      slug:            seoReport?.seo?.slug             ?? job.watchlist.headline.toLowerCase().replace(/\s+/g, '-').slice(0, 60),
      content:         seoReport?.polish?.polishedBody  ?? writeReport?.article?.body ?? '',
      excerpt:         seoReport?.seo?.metaDescription  ?? '',
      metaTitle:       seoReport?.seo?.metaTitle        ?? '',
      metaDescription: seoReport?.seo?.metaDescription  ?? '',
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
