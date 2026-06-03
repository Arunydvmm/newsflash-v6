import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Reset all token counters to 0 for fresh testing
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    
    const config = await prisma.nfSystemConfig.upsert({
      where: { id: 'default' },
      update: {
        groqTokensToday: 0,
        googleTokensToday: 0,
        mistralTokensToday: 0,
        tokenResetDate: today
      },
      create: {
        id: 'default',
        groqTokensToday: 0,
        googleTokensToday: 0,
        mistralTokensToday: 0,
        tokenResetDate: today
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Token counters reset to 0',
      config: {
        groqTokensToday: config.groqTokensToday,
        googleTokensToday: config.googleTokensToday,
        mistralTokensToday: config.mistralTokensToday,
        tokenResetDate: config.tokenResetDate
      }
    })
  } catch (error: any) {
    console.error('Error resetting tokens:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
