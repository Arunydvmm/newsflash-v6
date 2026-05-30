// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import Article from '../../models/Article'
import { getAuth, getEmployeeAuth } from '../../lib/auth'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'published'
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = parseInt(searchParams.get('skip') || '0')

  const query: any = {}
  if (status !== 'all') query.status = status

  const articles = await Article.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean()

  const total = await Article.countDocuments(query)

  return NextResponse.json({ articles, total })
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req) || getEmployeeAuth(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()

  // Employees cannot publish directly
  if (auth.type === 'employee') {
    body.status = 'pending_review'
  }

  const article = await Article.create(body)
  return NextResponse.json(article, { status: 201 })
}