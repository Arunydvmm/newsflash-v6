import { PrismaClient } from '@prisma/client'
import { scoutAgent } from './agents/agent1-scout'
import { extractAgent } from './agents/agent2-extract'
import { writeAgent } from './agents/agent3-write'
import { reviewAgent } from './agents/agent4-review'
import { chiefAgent } from './agents/agent5-chief'
import { generateReport } from './report.generator'

const prisma = new PrismaClient()
const resend = process.env.RESEND_API_KEY ? new (require('resend').Resend)(process.env.RESEND_API_KEY) : null

interface StoryData {
  headline: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date
  contentSnippet: string
}

const STAGES = [
  { name: 'SCOUT', agent: scoutAgent, nextStatus: 'EXTRACT' },
  { name: 'EXTRACT', agent: extractAgent, nextStatus: 'WRITE' },
  { name: 'WRITE', agent: writeAgent, nextStatus: 'REVIEW' },
  { name: 'REVIEW', agent: reviewAgent, nextStatus: 'CHIEF' },
  { name: 'CHIEF', agent: chiefAgent, nextStatus: 'DRAFT_READY' }
]

async function sendBlockEmail(articleId: string, reason: string) {
  if (!resend || !process.env.ADMIN_EMAIL) {
    console.warn('Resend API key or ADMIN_EMAIL not set, skipping email notification')
    return
  }
  try {
    await resend.emails.send({
      from: 'NewsFlash AI <noreply@newsflash-v6.onrender.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 Article BLOCKED - ${articleId}`,
      html: `
        <h2>Article Blocked in Pipeline</h2>
        <p><strong>Article ID:</strong> ${articleId}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>Please review the article in the admin dashboard.</p>
      `
    })
  } catch (error) {
    console.error('Failed to send block email:', error)
  }
}

export async function runPipeline(storyData: StoryData): Promise<void> {
  // Check emergency kill switch
  const config = await prisma.nfSystemConfig.findFirst()
  if (config?.emergencyStop) {
    console.warn('Emergency kill switch is active - pipeline stopped')
    return
  }

  // Create article record
  const article = await prisma.nfArticle.create({
    data: {
      title: storyData.headline,
      content: storyData.contentSnippet,
      sourceUrl: storyData.sourceUrl,
      sourceName: storyData.sourceName,
      pipelineStatus: 'SCOUT',
      currentStage: 'SCOUT'
    }
  })

  // Create workflow record
  const workflow = await prisma.nfWorkflow.create({
    data: {
      articleId: article.id,
      status: 'SCOUT'
    }
  })

  let currentContent = storyData.contentSnippet
  let allPreviousReports: Record<string, any> = {}
  let totalTokensUsed = 0
  let totalProcessingTime = 0

  try {
    // Run all 5 stages
    for (const stage of STAGES) {
      const startTime = Date.now()

      const input = {
        jobId: article.id,
        currentContent,
        allPreviousReports,
        sourceData: { url: storyData.sourceUrl, name: storyData.sourceName, publishedAt: storyData.publishedAt },
        metadata: {
          title: storyData.headline,
          region: 'India',
          priority: 'STANDARD'
        }
      }

      const result = await stage.agent(input)

      // Save content log
      await prisma.nfContentLog.create({
        data: {
          articleId: article.id,
          stageName: stage.name,
          contentBefore: currentContent,
          contentAfter: result.modifiedContent
        }
      })

      // Save stage log
      await prisma.nfStageLog.create({
        data: {
          articleId: article.id,
          stageName: stage.name,
          stageStatus: 'COMPLETED',
          report: result.stageReport,
          confidence: result.confidence,
          recommendation: result.recommendation,
          tokensUsed: result.tokensUsed,
          processingMs: result.processingMs
        }
      })

      totalTokensUsed += result.tokensUsed
      totalProcessingTime += result.processingMs

      // Store stage report for next stage
      allPreviousReports[stage.name] = result.stageReport

      // Update article
      await prisma.nfArticle.update({
        where: { id: article.id },
        data: {
          currentStage: stage.name.toLowerCase(),
          pipelineStatus: stage.nextStatus as any,
          content: result.modifiedContent
        }
      })

      // HARD RULE: If recommendation is BLOCK, stop pipeline
      if (result.recommendation === 'BLOCK') {
        await prisma.nfArticle.update({
          where: { id: article.id },
          data: {
            pipelineStatus: 'BLOCKED' as any,
            blockReason: `Blocked at ${stage.name} stage`
          }
        })

        await prisma.nfWorkflow.update({
          where: { id: workflow.id },
          data: {
            status: 'BLOCKED' as any,
            completedAt: new Date()
          }
        })

        // Log to audit
        await prisma.nfAuditLog.create({
          data: {
            articleId: article.id,
            action: 'BLOCK',
            performedBy: 'AI_PIPELINE',
            reason: `Blocked at ${stage.name} stage`,
            metadata: { stage: stage.name, report: result.stageReport }
          }
        })

        // Send email
        await sendBlockEmail(article.id, `Blocked at ${stage.name} stage`)

        return
      }

      currentContent = result.modifiedContent

      // Add 2-second delay between agent calls to prevent rate limit bursts
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Generate summary report
    await generateReport(article.id, totalTokensUsed, totalProcessingTime)

    // Update workflow
    await prisma.nfWorkflow.update({
      where: { id: workflow.id },
      data: {
        status: 'DRAFT_READY' as any,
        completedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Pipeline error:', error)

    await prisma.nfWorkflow.update({
      where: { id: workflow.id },
      data: {
        status: 'BLOCKED',
        error: String(error),
        completedAt: new Date()
      }
    })

    await prisma.nfArticle.update({
      where: { id: article.id },
      data: {
        pipelineStatus: 'BLOCKED',
        blockReason: 'Pipeline error: ' + String(error)
      }
    })
  }
}
