import { AGENT_KEYS, FALLBACK_KEYS } from './agent-keys.config'
import { canUseProvider, recordTokens } from './token-budget'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Parse actual retry wait time from Groq error message
function parseRetryAfter(errorMessage: string): number {
  const minMatch = errorMessage?.match(/(\d+)m[\d.]+s/)
  const secMatch = errorMessage?.match(/in ([\d.]+)s/)
  if (minMatch) return (parseInt(minMatch[1]) + 1) * 60 * 1000  // minutes + 1 buffer
  if (secMatch) return (parseFloat(secMatch[1]) + 5) * 1000     // seconds + 5s buffer
  return 65000 // default 65s
}

// Update sleep status in DB for admin panel visibility
async function setSleepStatus(jobId: string, agentName: string, sleeping: boolean, reason = '', wakeAt = 0) {
  try {
    const config  = await prisma.nfSystemConfig.findFirst()
    const statuses = config?.agentSleepStatuses ? JSON.parse(config.agentSleepStatuses as string) : {}
    const key = `${jobId}_${agentName}` 
    if (sleeping) {
      statuses[key] = { jobId, agentName, sleeping: true, reason, sleepStarted: Date.now(), wakeAt }
    } else {
      delete statuses[key]
    }
    await prisma.nfSystemConfig.upsert({
      where:  { id: config?.id ?? 'default' },
      update: { agentSleepStatuses: JSON.stringify(statuses) },
      create: { id: 'default', agentSleepStatuses: JSON.stringify(statuses) }
    })
  } catch (e) { console.error('setSleepStatus error:', e) }
}

// Call any provider
async function callProvider(
  config: { key: string; provider: string; model: string },
  prompt: string,
  maxTokens: number
): Promise<{ data: any; tokensUsed: number }> {

  if (!config.key) throw new Error(`Missing API key for ${config.provider}`)

  // Check token budget before calling
  const provider = config.provider === 'google_legacy' ? 'google' : config.provider as any
  if (['groq', 'google', 'mistral'].includes(provider)) {
    const allowed = await canUseProvider(provider, maxTokens)
    if (!allowed) throw new Error(`TOKEN_BUDGET_EXCEEDED:${provider}`)
  }

  let res: Response
  let body: any

  if (config.provider === 'groq') {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.3 }),
      signal: AbortSignal.timeout(30000)
    })
    if (!res.ok) { const e: any = new Error((await res.json()).error?.message ?? 'Groq error'); e.status = res.status; throw e }
    body = await res.json()
    const raw = body.choices[0].message.content
    const tokens = body.usage?.total_tokens ?? 0
    await recordTokens('groq', tokens)
    return { data: JSON.parse(raw.replace(/```json|```/g, '').trim()), tokensUsed: tokens }
  }

  if (config.provider === 'openrouter') {
    // Try multiple free models in order until one works
    const modelsToTry = [
      config.model,
      'mistralai/mistral-7b-instruct:free',
      'google/gemma-2-9b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'qwen/qwen-2-7b-instruct:free'
    ]
    for (const model of modelsToTry) {
      try {
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? '',
            'X-Title': 'NewsFlash AI Newsroom'
          },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.3 }),
          signal: AbortSignal.timeout(60000)
        })
        if (!res.ok) {
          const errBody = await res.json()
          const msg = errBody.error?.message ?? 'OpenRouter error'
          if (msg.includes('provider') || msg.includes('offline') || res.status === 503) {
            console.warn(`OpenRouter model ${model} unavailable — trying next`)
            continue // try next model
          }
          const e: any = new Error(msg); e.status = res.status; throw e
        }
        body = await res.json()
        const raw = body.choices[0].message.content
        return { data: JSON.parse(raw.replace(/```json|```/g, '').trim()), tokensUsed: body.usage?.total_tokens ?? 0 }
      } catch (modelErr: any) {
        if (modelErr.message?.includes('TOKEN_BUDGET')) throw modelErr
        console.warn(`OpenRouter ${model} failed: ${modelErr.message} — trying next model`)
      }
    }
    throw new Error('All OpenRouter free models unavailable')
  }

  if (config.provider === 'google' || config.provider === 'google_legacy') {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 } }),
        signal: AbortSignal.timeout(30000)
      }
    )
    if (!res.ok) { const e: any = new Error((await res.json()).error?.message ?? 'Google error'); e.status = res.status; throw e }
    body = await res.json()
    const raw = body.candidates[0].content.parts[0].text
    const tokens = body.usageMetadata?.totalTokenCount ?? 0
    await recordTokens('google', tokens)
    return { data: JSON.parse(raw.replace(/```json|```/g, '').trim()), tokensUsed: tokens }
  }

  if (config.provider === 'mistral') {
    res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.3 }),
      signal: AbortSignal.timeout(30000)
    })
    if (!res.ok) { const e: any = new Error((await res.json()).error?.message ?? 'Mistral error'); e.status = res.status; throw e }
    body = await res.json()
    const raw = body.choices[0].message.content
    const tokens = body.usage?.total_tokens ?? 0
    await recordTokens('mistral', tokens)
    return { data: JSON.parse(raw.replace(/```json|```/g, '').trim()), tokensUsed: tokens }
  }

  throw new Error(`Unknown provider: ${config.provider}`)
}

// Main agent caller — primary → backup → fallback → smart sleep → final retry
export async function callAgent(
  agentName: keyof typeof AGENT_KEYS,
  prompt: string,
  maxTokens: number,
  jobId: string
): Promise<{ data: any; tokensUsed: number; providerUsed: string; modelUsed: string; usedKey: 'primary' | 'backup' | 'fallback' | 'retry_after_sleep'; sleepOccurred: boolean; sleepDurationMs: number }> {

  const config = AGENT_KEYS[agentName]
  const attempts = [
    { label: 'primary',  cfg: config.primary },
    { label: 'backup',   cfg: config.backup  },
    ...FALLBACK_KEYS.filter(k => k.key).map((k, i) => ({ label: `fallback_${i+1}`, cfg: k }))
  ]

  // Remove duplicate keys (same key = same result so skip dupes)
  const seen = new Set<string>()
  const uniqueAttempts = attempts.filter(a => {
    if (seen.has(a.cfg.key)) return false
    seen.add(a.cfg.key)
    return true
  })

  let lastError: any = null
  let sleepOccurred = false
  let totalSleepMs = 0

  for (const attempt of uniqueAttempts) {
    try {
      const result = await callProvider(attempt.cfg, prompt, maxTokens)
      if (sleepOccurred) await setSleepStatus(jobId, agentName, false)
      return {
        ...result,
        providerUsed: attempt.cfg.provider,
        modelUsed:    attempt.cfg.model,
        usedKey:       attempt.label === 'primary' ? 'primary' : attempt.label === 'backup' ? 'backup' : 'fallback',
        sleepOccurred,
        sleepDurationMs: totalSleepMs
      }
    } catch (err: any) {
      lastError = err
      // Budget exceeded — skip this provider entirely, try next
      if (err.message?.includes('TOKEN_BUDGET_EXCEEDED')) {
        console.warn(`[${agentName}] ${attempt.label} budget exceeded — trying next provider`)
        continue
      }
      // Rate limited — parse actual wait time, sleep, then continue to next attempt
      if (err.status === 429) {
        const waitMs = parseRetryAfter(err.message)
        // Only sleep if wait is under 5 minutes — otherwise skip and try next key
        if (waitMs <= 300000) {
          console.warn(`[${agentName}] ${attempt.label} rate limited — sleeping ${Math.round(waitMs/1000)}s`)
          sleepOccurred = true
          totalSleepMs += waitMs
          await setSleepStatus(jobId, agentName, true, `Rate limited on ${attempt.cfg.provider} — waiting ${Math.round(waitMs/1000)}s`, Date.now() + waitMs)
          await new Promise(r => setTimeout(r, waitMs))
          await setSleepStatus(jobId, agentName, false)
          // Retry same attempt after sleep
          try {
            const result = await callProvider(attempt.cfg, prompt, maxTokens)
            return { ...result, providerUsed: attempt.cfg.provider, modelUsed: attempt.cfg.model, usedKey: 'retry_after_sleep', sleepOccurred: true, sleepDurationMs: totalSleepMs }
          } catch (retryErr: any) {
            console.warn(`[${agentName}] retry after sleep also failed — trying next key`)
          }
        } else {
          console.warn(`[${agentName}] retry wait too long (${Math.round(waitMs/60000)}m) — skipping to next key`)
        }
        continue
      }
      console.warn(`[${agentName}] ${attempt.label} failed: ${err.message}`)
    }
  }

  // All attempts exhausted — throw so pipeline can mark stage as failed
  throw new Error(`[${agentName}] All providers failed. Last error: ${lastError?.message}`)
}
