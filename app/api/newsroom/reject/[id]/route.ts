// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import NfArticle from '@/app/models/NfArticle'
import { getAuth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth(req)
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await connectDB()
  const { reason } = await req.json()
  await NfArticle.findByIdAndUpdate(params.id, {
    pipelineStatus: 'REJECTED',
    humanDecision: 'REJECTED',
    humanNotes: reason || 'Rejected by editor',
    reviewedBy: auth.username,
    reviewedAt: new Date()
  })
  return NextResponse.json({ success: true })
}