import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import { monitoringAgent } from './agents/monitoring.agent'
import { researchAgent } from './agents/research.agent'
import { extractionAgent } from './agents/extraction.agent'
import { factcheckAgent } from './agents/factcheck.agent'
import { juniorAgent } from './agents/junior.agent'
import { seniorAgent } from './agents/senior.agent'
import { biasAgent } from './agents/bias.agent'
import { legalAgent } from './agents/legal.agent'
import { copyrightAgent } from './agents/copyright.agent'
import { seoAgent } from './agents/seo.agent'
import { chiefeditorAgent } from './agents/chiefeditor.agent'
import { generateReport } from './report.generator'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

interface StoryData {
  headline: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date
  contentSnippet: string
}

const STAGES = [
  { name: 'MONITORING', agent: monitoringAgent, status: 'RESEARCH' },
  { name: 'RESEARCH', agent: researchAgent, status: 'EXTRACTION' },
  { name: 'EXTRACTION', agent: extractionAgent, status: 'FACT_CHECK' },
  { name: 'FACT_CHECK', agent: factcheckAgent, status: 'JUNIOR_DRAFT' },
  { name: 'JUNIOR_DRAFT', agent: juniorAgent, status: 'SENIOR_EDIT' },
  { name: 'SENIOR_EDIT', agent: seniorAgent, status: 'BIAS_REVIEW' },
  { name: 'BIAS_REVIEW', agent: biasAgent, status: 'LEGAL_REVIEW' },
  { name: 'LEGAL_REVIEW', agent: legalAgent, status: 'COPYRIGHT_REVIEW' },
  { name: 'COPYRIGHT_REVIEW', agent: copyrightAgent, status: 'SEO_REVIEW' },
  { name: 'SEO_REVIEW', agent: seoAgent, status: 'CHIEF_EDITOR' },
  { name: 'CHIEF_EDITOR', agent: chiefeditorAgent, status: 'DRAFT_READY' }
]

async function sendBlockEmail(articleId: string, reason: string) {
  try {
    await resend.emails.send({
      from: 'NewsFlash AI <noreply@newsflash-v6.onrender.com>',
      to: process.env.ADMIN_EMAIL || 'admin@newsflash.com',
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
  // Create article record
  const article = await prisma.nfArticle.create({
    data: {
      title: storyData.headline,
      content: storyData.contentSnippet,
      sourceUrl: storyData.sourceUrl,
      sourceName: storyData.sourceName,
      pipelineStatus: 'MONITORING',
      currentStage: 'monitoring'
    }
  })

  // Create workflow record
  const workflow = await prisma.nfWorkflow.create({
    data: {
      articleId: article.id,
      status: 'MONITORING'
    }
  })

  let currentContent = storyData.contentSnippet
  let previousStageReport = {}
  let totalTokensUsed = 0
  let totalProcessingTime = 0

  try {
    // Run all 11 stages
    for (const stage of STAGES) {
      const startTime = Date.now()

      const input = {
        articleId: article.id,
        currentContent,
        previousStageReport,
        sourceData: { url: storyData.sourceUrl, name: storyData.sourceName },
        metadata: {
          title: storyData.headline,
          region: 'India',
          priority: 'STANDARD',
          language: 'en'
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

      // Update article
      await prisma.nfArticle.update({
        where: { id: article.id },
        data: {
          currentStage: stage.name.toLowerCase(),
          pipelineStatus: stage.status,
          content: result.modifiedContent
        }
      })

      // HARD RULE: If recommendation is BLOCK, stop pipeline
      if (result.recommendation === 'BLOCK') {
        await prisma.nfArticle.update({
          where: { id: article.id },
          data: {
            pipelineStatus: 'BLOCKED',
            blockReason: `Blocked at ${stage.name} stage`
          }
        })

        await prisma.nfWorkflow.update({
          where: { id: workflow.id },
          data: {
            status: 'BLOCKED',
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
      previousStageReport = result.stageReport
    }

    // Generate summary report
    await generateReport(article.id, totalTokensUsed, totalProcessingTime)

    // Update workflow
    await prisma.nfWorkflow.update({
      where: { id: workflow.id },
      data: {
        status: 'DRAFT_READY',
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
