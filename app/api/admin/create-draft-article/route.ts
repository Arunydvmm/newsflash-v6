import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  // Check admin secret
  const secret = req.headers.get('x-scheduler-secret')
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      title = 'Test Article: India Budget 2024 Highlights',
      content = 'This is a comprehensive test article about the India Budget 2024.',
      excerpt = 'Key highlights from the India Budget 2024 announcement.',
      category = 'POLITICS'
    } = body

    // Create a draft article directly
    const article = await prisma.nfArticle.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-').slice(0, 60),
        content,
        excerpt,
        metaTitle: title,
        metaDescription: excerpt,
        tags: ['test', 'budget'],
        category,
        sourceUrl: 'https://test.example.com',
        sourceName: 'Test Source',
        pipelineStatus: 'DRAFT_READY',
        contentOrigin: 'MANUAL_TEST',
        editorialGrade: 'A',
        overallScore: 9.5
      }
    })

    return NextResponse.json({
      success: true,
      articleId: article.id,
      message: `Created test draft article: ${article.title}`
    })
  } catch (error) {
    console.error('Create draft error:', error)
    return NextResponse.json(
      { error: 'Failed to create draft article', details: String(error) },
      { status: 500 }
    )
  }
}
