// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import { getAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const today = new Date(); today.setHours(0,0,0,0)
  const [draftsReady, blocked, publishedToday, running, total] = await Promise.all([
    NfArticle.countDocuments({ pipelineStatus: 'DRAFT_READY' }),
    NfArticle.countDocuments({ pipelineStatus: 'BLOCKED' }),
    NfArticle.countDocuments({ pipelineStatus: 'PUBLISHED', reviewedAt: { $gte: today } }),
    NfArticle.countDocuments({ pipelineStatus: { $nin: ['DRAFT_READY','BLOCKED','PUBLISHED','REJECTED','APPROVED'] } }),
    NfArticle.countDocuments({ pipelineStatus: 'PUBLISHED' }),
  ])
  return NextResponse.json({ draftsReady, blocked, publishedToday, running, total })
}