import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const article = await prisma.nfArticle.findUnique({
      where: { id: params.id },
      include: {
        workflow: true,
        stageLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
