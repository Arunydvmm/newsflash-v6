import { AGENT_KEYS, FALLBACK_KEYS, KEY_SHARING_MAP } from './agent-keys.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLEEP_DURATION_MS = 45000 // 45 seconds sleep on failure
const RATE_LIMIT_DELAY_MS = 2000 // 2 seconds delay between calls to avoid rate limits

// Helper function to clean and parse JSON from AI response
function cleanAndParseJSON(raw: string): any {
  if (!raw || raw.trim().length === 0) {
    throw new Error('Empty response from AI')
  }
  
  // Remove markdown code blocks
  let clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  
  if (clean.length === 0) {
    throw new Error('Empty response after cleaning markdown')
  }
  
  // Try to parse as-is
  try {
    return JSON.parse(clean)
  } catch (e) {
    // If that fails, try to extract JSON from the response
    // Look for JSON object pattern
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (e2) {
        throw new Error(`Failed to parse AI response as JSON: ${clean.slice(0, 200)}`)
      }
    }
    throw new Error(`Failed to parse AI response as JSON: ${clean.slice(0, 200)}`)
  }
}

export interface AgentCallResult {
  data: any
  tokensUsed: number
  providerUsed: string
  modelUsed: string
  usedKey: 'primary' | 'backup' | 'fallback' | 'retry_after_sleep'
  sleepOccurred: boolean
  sleepDurationMs: number
  blockReason?: string
}

// Get env variable name from key value (reverse lookup)
function getEnvKeyName(keyValue: string): string {
  for (const [envName] of Object.entries(KEY_SHARING_MAP)) {
    if (process.env[envName] === keyValue) return envName
  }
  return 'UNKNOWN_KEY'
}

// Mark key cooldown in DB so all agents sharing this key know
async function markKeyCooldown(envKeyName: string, cooldownMs: number = 60000) {
  try {
    const config = await prisma.nfSystemConfig.findFirst()
    const existing = config?.keyCooldowns ? JSON.parse(config.keyCooldowns as string) : {}
    existing[envKeyName] = Date.now() + cooldownMs
    await prisma.nfSystemConfig.upsert({
      where: { id: config?.id ?? 'default' },
      update: { keyCooldowns: JSON.stringify(existing) },
      create: { id: 'default', keyCooldowns: JSON.stringify(existing) }
    })
  } catch (e) {
    console.error('Failed to mark key cooldown in DB:', e)
  }
}

async function isKeyCoolingDown(envKeyName: string): Promise<boolean> {
  try {
    const config = await prisma.nfSystemConfig.findFirst()
    const cooldowns = config?.keyCooldowns ? JSON.parse(config.keyCooldowns as string) : {}
    return !!(cooldowns[envKeyName] && cooldowns[envKeyName] > Date.now())
  } catch {
    return false
  }
}

// Update sleep status in DB so admin panel can see it
async function updateAgentSleepStatus(
  jobId: string,
  agentName: string,
  sleeping: boolean,
  reason: string = '',
  wakeAt?: number
) {
  try {
    const config = await prisma.nfSystemConfig.findFirst()
    const sleepStatuses = config?.agentSleepStatuses
      ? JSON.parse(config.agentSleepStatuses as string)
      : {}
    if (sleeping) {
      sleepStatuses[`${jobId}_${agentName}`] = {
        jobId,
        agentName,
        sleeping: true,
        reason,
        sleepStarted: Date.now(),
        wakeAt: wakeAt ?? Date.now() + SLEEP_DURATION_MS
      }
    } else {
      delete sleepStatuses[`${jobId}_${agentName}`]
    }
    await prisma.nfSystemConfig.upsert({
      where: { id: config?.id ?? 'default' },
      update: { agentSleepStatuses: JSON.stringify(sleepStatuses) },
      create: { id: 'default', agentSleepStatuses: JSON.stringify(sleepStatuses) }
    })
  } catch (e) {
    console.error('Failed to update sleep status:', e)
  }
}

async function callProvider(
  config: { key: string; provider: string; model: string },
  prompt: string,
  maxTokens: number
): Promise<{ data: any; tokensUsed: number }> {

  if (!config.key) throw new Error(`API key missing for provider: ${config.provider}`)

  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS))

  console.log(`[AI Call] Provider: ${config.provider}, Model: ${config.model}`)

  if (config.provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    })
    if (!res.ok) {
      const err = await res.json()
      const error: any = new Error(err.error?.message || 'Groq API error')
      error.status = res.status
      throw error
    }
    const json = await res.json()
    const raw = json.choices[0].message.content
    console.log(`[AI Response] Groq raw response length: ${raw?.length || 0}`)
    return { data: cleanAndParseJSON(raw), tokensUsed: json.usage?.total_tokens ?? 0 }
  }

  if (config.provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? '',
        'X-Title': 'NewsFlash AI Newsroom'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    })
    if (!res.ok) {
      const err = await res.json()
      const error: any = new Error(err.error?.message || 'OpenRouter API error')
      error.status = res.status
      throw error
    }
    const json = await res.json()
    const raw = json.choices[0].message.content
    console.log(`[AI Response] OpenRouter raw response length: ${raw?.length || 0}`)
    return { data: cleanAndParseJSON(raw), tokensUsed: json.usage?.total_tokens ?? 0 }
  }

  if (config.provider === 'google' || config.provider === 'google_legacy') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
        })
      }
    )
    if (!res.ok) {
      const err = await res.json()
      const error: any = new Error(err.error?.message || 'Google API error')
      error.status = res.status
      throw error
    }
    const json = await res.json()
    const raw = json.candidates[0].content.parts[0].text
    console.log(`[AI Response] Google raw response length: ${raw?.length || 0}`)
    return { data: cleanAndParseJSON(raw), tokensUsed: json.usageMetadata?.totalTokenCount ?? 0 }
  }

  if (config.provider === 'mistral') {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    })
    if (!res.ok) {
      const err = await res.json()
      const error: any = new Error(err.error?.message || 'Mistral API error')
      error.status = res.status
      throw error
    }
    const json = await res.json()
    const raw = json.choices[0].message.content
    console.log(`[AI Response] Mistral raw response length: ${raw?.length || 0}`)
    return { data: cleanAndParseJSON(raw), tokensUsed: json.usage?.total_tokens ?? 0 }
  }

  throw new Error(`Unknown provider: ${config.provider}`)
}

export async function callAgent(
  agentName: keyof typeof AGENT_KEYS,
  prompt: string,
  maxTokens: number,
  jobId: string
): Promise<AgentCallResult> {

  const config = AGENT_KEYS[agentName]
  const primaryEnvKey = getEnvKeyName(config.primary.key)
  const backupEnvKey = getEnvKeyName(config.backup.key)
  const sameKey = primaryEnvKey === backupEnvKey
  let sleepOccurred = false

  // Try primary
  const primaryCooling = await isKeyCoolingDown(primaryEnvKey)
  if (!primaryCooling) {
    try {
      const result = await callProvider(config.primary, prompt, maxTokens)
      return { ...result, providerUsed: config.primary.provider, modelUsed: config.primary.model, usedKey: 'primary', sleepOccurred: false, sleepDurationMs: 0 }
    } catch (err: any) {
      if (err.status === 429) await markKeyCooldown(primaryEnvKey, 60000)
      console.warn(`[${agentName}] primary failed: ${err.message}`)
    }
  }

  // Try backup (only if different key)
  if (!sameKey) {
    const backupCooling = await isKeyCoolingDown(backupEnvKey)
    if (!backupCooling) {
      try {
        const result = await callProvider(config.backup, prompt, maxTokens)
        return { ...result, providerUsed: config.backup.provider, modelUsed: config.backup.model, usedKey: 'backup', sleepOccurred: false, sleepDurationMs: 0 }
      } catch (err: any) {
        if (err.status === 429) await markKeyCooldown(backupEnvKey, 60000)
        console.warn(`[${agentName}] backup failed: ${err.message}`)
      }
    }
  }

  // Try universal fallback keys
  for (const fallback of FALLBACK_KEYS) {
    if (!fallback.key) continue
    try {
      const result = await callProvider(fallback, prompt, maxTokens)
      return { ...result, providerUsed: fallback.provider, modelUsed: fallback.model, usedKey: 'fallback', sleepOccurred: false, sleepDurationMs: 0 }
    } catch (err: any) {
      console.warn(`[${agentName}] fallback ${fallback.provider} failed: ${err.message}`)
    }
  }

  // ALL KEYS FAILED — ENTER SLEEP MODE FOR 45 SECONDS
  console.warn(`[${agentName}] All keys failed — entering sleep mode for ${SLEEP_DURATION_MS/1000}s`)
  await updateAgentSleepStatus(jobId, agentName, true, 'All API keys failed or cooling down', Date.now() + SLEEP_DURATION_MS)
  await new Promise(r => setTimeout(r, SLEEP_DURATION_MS))
  await updateAgentSleepStatus(jobId, agentName, false)
  sleepOccurred = true

  // Retry primary after sleep
  try {
    const result = await callProvider(config.primary, prompt, maxTokens)
    return { ...result, providerUsed: config.primary.provider, modelUsed: config.primary.model, usedKey: 'retry_after_sleep', sleepOccurred: true, sleepDurationMs: SLEEP_DURATION_MS }
  } catch (finalErr: any) {
    // Sleep and retry failed — throw to pipeline to mark stage as failed
    throw new Error(`[${agentName}] Failed after sleep retry: ${finalErr.message}`)
  }
}
