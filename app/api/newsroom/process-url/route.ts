// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import { runPipeline } from '@/lib/newsroom/pipeline'
import { getAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await req.json()
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  await connectDB()

  // Check if URL already exists
  const exists = await NfArticle.findOne({ sourceUrl: url })
  if (exists) {
    return NextResponse.json({ error: 'URL already processed' }, { status: 409 })
  }

  // Create article with URL
  const article = await NfArticle.create({
    title: 'Manual URL Processing',
    content: '',
    sourceUrl: url,
    sourceName: 'Manual',
    region: 'India',
    pipelineStatus: 'MONITORING'
  })

  // Run pipeline in background
  runPipeline(article._id.toString()).catch(console.error)

  return NextResponse.json({ success: true, articleId: article._id })
}
