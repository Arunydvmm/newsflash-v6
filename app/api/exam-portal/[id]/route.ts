// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import ExamPortal from '../../../models/ExamPortal'
import { getAuth } from '../../../lib/auth'

export async function GET(req: NextRequest, { params }: any) {
  await connectDB()
  const item = await ExamPortal.findById(params.id).lean()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: any) {
  const auth = getAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const item = await ExamPortal.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: any) {
  const auth = getAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  await ExamPortal.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
