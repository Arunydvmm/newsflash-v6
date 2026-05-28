// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import ExamPortal from '../../models/ExamPortal'
import { getAuth } from '../../lib/auth'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = req.nextUrl
  const page     = parseInt(searchParams.get('page')  || '1')
  const limit    = parseInt(searchParams.get('limit') || '20')
  const type     = searchParams.get('type') || ''
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const status   = searchParams.get('status') || ''

  const q: any = { isActive: true, isExpired: false }
  if (type) q.type = type
  if (category) q.category = category
  if (search) q.$text = { $search: search }
  if (status) q.status = status

  const [items, total] = await Promise.all([
    ExamPortal.find(q).sort({ isFeatured: -1, createdAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    ExamPortal.countDocuments(q),
  ])
  return NextResponse.json({ items, total, page, pages: Math.ceil(total/limit) })
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const item = await ExamPortal.create(body)
  return NextResponse.json(item, { status: 201 })
}
