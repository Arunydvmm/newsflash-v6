import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuth()
  if (!auth || auth.role !== 'SuperAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const maskKey = (key?: string) => {
    if (!key) return '❌ missing'
    return `✅ set (${key.substring(0, 6)}****)`
  }

  const keyStatus = {
    'OPENROUTER_KEY_1': maskKey(process.env.OPENROUTER_KEY_1),
    'OPENROUTER_KEY_2': maskKey(process.env.OPENROUTER_KEY_2),
    'GROQ_KEY_1': maskKey(process.env.GROQ_KEY_1),
    'GOOGLE_AI_KEY_1': maskKey(process.env.GOOGLE_AI_KEY_1),
    'MISTRAL_KEY_1': maskKey(process.env.MISTRAL_KEY_1),
    'GEMINI_KEY_1': maskKey(process.env.GEMINI_KEY_1),
    'GEMINI_KEY_2': maskKey(process.env.GEMINI_KEY_2),
  }

  return NextResponse.json(keyStatus)
}
