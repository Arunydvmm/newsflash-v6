import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

async function getOrResetConfig() {
  const config = await prisma.nfSystemConfig.findFirst()
  const today  = getTodayIST()

  // Reset token counters at midnight IST
  if (!config || config.tokenResetDate !== today) {
    return prisma.nfSystemConfig.upsert({
      where:  { id: config?.id ?? 'default' },
      update: { groqTokensToday: 0, googleTokensToday: 0, mistralTokensToday: 0, tokenResetDate: today },
      create: { id: 'default', groqTokensToday: 0, googleTokensToday: 0, mistralTokensToday: 0, tokenResetDate: today }
    })
  }
  return config
}

export async function canUseProvider(provider: 'groq' | 'google' | 'mistral', estimatedTokens: number): Promise<boolean> {
  const config = await getOrResetConfig()
  const budgets = {
    groq:    { used: config.groqTokensToday,    limit: 60000 },
    google:  { used: config.googleTokensToday,  limit: 1200  },
    mistral: { used: config.mistralTokensToday, limit: 400   }
  }
  const b = budgets[provider]
  return (b.used + estimatedTokens) <= b.limit
}

export async function recordTokens(provider: 'groq' | 'google' | 'mistral', tokens: number) {
  const config = await getOrResetConfig()
  const field = { groq: 'groqTokensToday', google: 'googleTokensToday', mistral: 'mistralTokensToday' }[provider]
  await prisma.nfSystemConfig.update({
    where: { id: config.id },
    data:  { [field]: { increment: tokens } }
  })
}

export async function getTokenStatus() {
  const config = await getOrResetConfig()
  return {
    groq:    { used: config.groqTokensToday,    limit: 60000, percent: Math.round(config.groqTokensToday    / 60000 * 100) },
    google:  { used: config.googleTokensToday,  limit: 1200,  percent: Math.round(config.googleTokensToday  / 1200  * 100) },
    mistral: { used: config.mistralTokensToday, limit: 400,   percent: Math.round(config.mistralTokensToday / 400   * 100) },
    resetsAt: 'Midnight IST',
    resetDate: config.tokenResetDate
  }
}
