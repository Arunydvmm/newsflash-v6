// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import Article from '@/app/models/Article'
import { getAuth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await connectDB()
  const nf = await NfArticle.findById(params.id)
  if (!nf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (nf.legalVerdict === 'BLOCKED') return NextResponse.json({ error: 'Blocked by legal review' }, { status: 403 })
  if (nf.copyrightVerdict === 'BLOCKED') return NextResponse.json({ error: 'Blocked by copyright review' }, { status: 403 })
  if ((nf.plagiarismScore || 0) > 0.60) return NextResponse.json({ error: 'Plagiarism score too high' }, { status: 403 })

  const article = await Article.create({
    title: nf.title,
    summary: nf.summary || nf.title,
    content: nf.content + `\n\n<p style="font-size:12px;color:#888;border-top:1px solid #eee;padding-top:8px;margin-top:24px">${nf.aiDisclosure}</p>`,
    slug: nf.slug,
    category: nf.category || 'India',
    tags: nf.tags || [],
    keyHighlights: nf.keyHighlights || [],
    referenceLinks: nf.referenceLinks || [],
    isBreaking: nf.priority === 'BREAKING',
    status: 'published',
    author: 'NewsFlash AI Desk',
    isDataDriven: true,
    dataSource: nf.sourceName,
    articleType: 'ai-generated',
  })

  await NfArticle.findByIdAndUpdate(params.id, {
    pipelineStatus: 'PUBLISHED',
    publishedArticleId: article._id,
    humanDecision: 'APPROVED',
    reviewedBy: auth.username,
    reviewedAt: new Date()
  })

  return NextResponse.json({ success: true, articleId: article._id, slug: article.slug })
}