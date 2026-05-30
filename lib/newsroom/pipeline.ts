// @ts-nocheck
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import nodemailer from 'nodemailer'
import {
  monitoringAgent, researchAgent, extractionAgent,
  factCheckAgent, journalistAgent, editorAgent,
  biasAgent, legalAgent, copyrightAgent,
  seoAgent, chiefEditorAgent
} from './agents'

const STAGES = [
  { name: 'monitoring',      fn: monitoringAgent,  field: 'monitoringReport',   status: 'RESEARCH' },
  { name: 'research',        fn: researchAgent,    field: 'researchReport',     status: 'EXTRACTION' },
  { name: 'extraction',      fn: extractionAgent,  field: 'extractionReport',   status: 'FACT_CHECK' },
  { name: 'factcheck',       fn: factCheckAgent,   field: 'factCheckReport',    status: 'JUNIOR_DRAFT' },
  { name: 'journalist',      fn: journalistAgent,  field: 'juniorDraftReport',  status: 'SENIOR_EDIT' },
  { name: 'editor',          fn: editorAgent,      field: 'seniorEditReport',   status: 'BIAS_REVIEW' },
  { name: 'bias',            fn: biasAgent,        field: 'biasReport',         status: 'LEGAL_REVIEW' },
  { name: 'legal',           fn: legalAgent,       field: 'legalReport',        status: 'COPYRIGHT_REVIEW' },
  { name: 'copyright',       fn: copyrightAgent,   field: 'copyrightReport',    status: 'SEO_REVIEW' },
  { name: 'seo',             fn: seoAgent,         field: 'seoReport',          status: 'CHIEF_EDITOR' },
  { name: 'chiefeditor',     fn: chiefEditorAgent, field: 'chiefEditorReport',  status: 'DRAFT_READY' },
]

async function sendEmail(subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    })
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject,
      text
    })
  } catch (e) { console.error('Email failed:', e) }
}

export async function runPipeline(nfArticleId: string) {
  await connectDB()
  const article = await NfArticle.findById(nfArticleId)
  if (!article) return { error: 'Article not found' }

  for (const stage of STAGES) {
    try {
      article.currentStage = stage.name
      await article.save()

      const result = await stage.fn(article.toObject())

      // Update content
      if (result.modifiedContent) article.content = result.modifiedContent
      // Save report
      article[stage.field] = result.report
      // Update confidence
      if (result.confidence) article.overallConfidence = result.confidence
      // Update status
      article.pipelineStatus = stage.status

      // Save verdicts from specific agents
      if (stage.name === 'legal') {
        article.legalVerdict = result.report?.legalVerdict || 'PENDING'
        article.overallRiskLevel = result.report?.riskLevel || 'UNKNOWN'
      }
      if (stage.name === 'copyright') {
        article.copyrightVerdict = result.report?.copyrightVerdict || 'PENDING'
        article.plagiarismScore = result.report?.plagiarismScore || 0
      }
      if (stage.name === 'factcheck') {
        article.factCheckVerdict = result.report?.falseClaimsFound ? 'FALSE_DETECTED' : 'VERIFIED'
      }
      if (stage.name === 'bias') {
        article.biasVerdict = result.report?.biasDetected ? 'BIAS_FOUND' : 'NEUTRAL'
      }
      if (stage.name === 'seo' && result.report) {
        article.metaDescription = result.report.metaDescription
        article.slug = result.report.slug
        article.socialPosts = result.report.socialPosts
      }
      if (stage.name === 'journalist' && result.report) {
        article.summary = result.report.summary || article.summary
        article.keyHighlights = result.report.keyHighlights || []
        article.tags = result.report.tags || []
      }
      if (stage.name === 'chiefeditor') {
        article.editorialGrade = result.report?.editorialGrade
      }

      await article.save()

      // CHECK FOR BLOCK
      if (result.recommendation === 'BLOCK') {
        article.pipelineStatus = 'BLOCKED'
        article.blockReason = `Blocked at ${stage.name}: ${JSON.stringify(result.report).slice(0,200)}`
        await article.save()
        await sendEmail(
          `[NewsFlash AI] ⚠️ Article BLOCKED: ${article.title}`,
          `Article blocked at stage: ${stage.name}\nReason: ${article.blockReason}\nID: ${nfArticleId}`
        )
        return { blocked: true, stage: stage.name, reason: article.blockReason }
      }

    } catch (err: any) {
      console.error(`Stage ${stage.name} failed:`, err.message)
      // Don't block on agent error, continue pipeline
    }
  }

  // Generate master summary
  article.masterSummary = {
    headline: article.title,
    generatedAt: new Date(),
    overallConfidence: article.overallConfidence,
    overallRiskLevel: article.overallRiskLevel,
    editorialGrade: article.editorialGrade,
    legalVerdict: article.legalVerdict,
    copyrightVerdict: article.copyrightVerdict,
    plagiarismScore: article.plagiarismScore,
    recommendation: article.legalVerdict === 'BLOCKED' || article.copyrightVerdict === 'BLOCKED'
      ? 'REJECT' : article.overallConfidence > 0.85 ? 'APPROVE' : 'REVIEW_REQUIRED'
  }
  article.pipelineStatus = 'DRAFT_READY'
  await article.save()

  await sendEmail(
    `[NewsFlash AI] ✅ New draft ready: ${article.title}`,
    `A new article draft is ready for your review.\nTitle: ${article.title}\nConfidence: ${article.overallConfidence}\nGrade: ${article.editorialGrade}\nVisit: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/newsroom/drafts`
  )

  return { success: true, nfArticleId }
}