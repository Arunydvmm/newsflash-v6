import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'
import mongoose from 'mongoose'
import Article from '@/models/Article'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const nfArticle = await prisma.nfArticle.findUnique({
      where: { id: params.id },
      include: { summaryReport: true }
    })

    if (!nfArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Safety checks
    const summaryReport = nfArticle.summaryReport as any
    if (nfArticle.pipelineStatus !== 'DRAFT_READY') {
      return NextResponse.json({ error: 'Article not ready for approval' }, { status: 403 })
    }
    if (!nfArticle.humanDecision || nfArticle.humanDecision !== 'APPROVED') {
      return NextResponse.json({ error: 'No human approval on record' }, { status: 403 })
    }
    if (summaryReport?.factCheckSummary?.falseClaims > 0) {
      return NextResponse.json({ error: 'Article has false claims' }, { status: 403 })
    }
    if (nfArticle.legalVerdict === 'BLOCKED') {
      return NextResponse.json({ error: 'Blocked by legal review' }, { status: 403 })
    }
    if (nfArticle.copyrightVerdict === 'BLOCKED') {
      return NextResponse.json({ error: 'Blocked by copyright review' }, { status: 403 })
    }
    if ((nfArticle.plagiarismScore || 0) > 0.6) {
      return NextResponse.json({ error: 'Plagiarism score too high' }, { status: 403 })
    }

    // Map to existing Article model (Mongoose)
    await mongoose.connect(process.env.MONGODB_URI!)
    
    const article = await Article.create({
      title: nfArticle.title,
      slug: nfArticle.slug || nfArticle.title.toLowerCase().replace(/\s+/g, '-'),
      category: nfArticle.category || 'India',
      summary: nfArticle.summary || nfArticle.title,
      content: nfArticle.content + `\n\n<p style="font-size:12px;color:#888;border-top:1px solid #eee;padding-top:8px;margin-top:24px">${nfArticle.aiDisclosure}</p>`,
      author: 'NewsFlash AI Desk',
      tags: nfArticle.tags || [],
      status: 'published',
      isDataDriven: true,
      articleType: 'ai-generated',
      dataSource: nfArticle.sourceName
    })

    // Update NfArticle
    await prisma.nfArticle.update({
      where: { id: params.id },
      data: {
        pipelineStatus: 'PUBLISHED',
        publishedArticleId: article._id.toString(),
        humanDecision: 'APPROVED',
        reviewedBy: auth.username,
        reviewedAt: new Date()
      }
    })

    // Log to audit
    await prisma.nfAuditLog.create({
      data: {
        articleId: params.id,
        action: 'APPROVE',
        performedBy: auth.username,
        reason: 'Approved and published'
      }
    })

    return NextResponse.json({ success: true, articleId: article._id.toString(), slug: article.slug })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json({ error: 'Failed to approve article' }, { status: 500 })
  }
}
