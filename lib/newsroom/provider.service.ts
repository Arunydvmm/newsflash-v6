import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

interface ProviderConfig {
  name: string
  apiKey: string | undefined
  model: string
  type: 'groq' | 'google' | 'openrouter' | 'mistral'
}

interface ProviderResponse {
  data: any
  tokensUsed: number
  provider: string
  model: string
}

// Provider cooldown tracking
const providerCooldowns = new Map<string, number>()

function isProviderInCooldown(providerName: string): boolean {
  const cooldownEnd = providerCooldowns.get(providerName)
  if (!cooldownEnd) return false
  if (Date.now() > cooldownEnd) {
    providerCooldowns.delete(providerName)
    return false
  }
  return true
}

function markProviderCooldown(providerName: string, durationMs: number = 60000) {
  providerCooldowns.set(providerName, Date.now() + durationMs)
}

// Provider configurations
const providers: ProviderConfig[] = [
  { name: 'OPENROUTER_1', apiKey: process.env.OPENROUTER_KEY_1, model: 'google/gemini-2.0-flash-thinking-exp:free', type: 'openrouter' },
  { name: 'OPENROUTER_2', apiKey: process.env.OPENROUTER_KEY_2, model: 'google/gemini-2.0-flash-exp:free', type: 'openrouter' },
  { name: 'OPENROUTER_3', apiKey: process.env.OPENROUTER_KEY_3, model: 'google/gemini-2.0-flash-thinking-exp:free', type: 'openrouter' },
  { name: 'OPENROUTER_4', apiKey: process.env.OPENROUTER_KEY_4, model: 'google/gemini-2.0-flash-thinking-exp:free', type: 'openrouter' },
  { name: 'GROQ_1', apiKey: process.env.GROQ_KEY_1, model: 'llama-3.1-8b-instant', type: 'groq' },
  { name: 'GOOGLE_AI_1', apiKey: process.env.GOOGLE_AI_KEY_1, model: 'gemini-1.5-flash', type: 'google' },
  { name: 'MISTRAL_1', apiKey: process.env.MISTRAL_KEY_1, model: 'mistral-small-latest', type: 'mistral' },
]

// Fallback order: OpenRouter → Google AI → Groq 70B → Mistral → Groq 8B → old Gemini keys
const fallbackOrder: string[] = [
  'OPENROUTER_1', 'OPENROUTER_2', 'OPENROUTER_3', 'OPENROUTER_4',
  'GOOGLE_AI_1',
  'GROQ_1',
  'MISTRAL_1',
]

// Agent to provider mapping
const agentProviderMapping: Record<string, string> = {
  'MONITORING': 'GROQ_1',
  'RESEARCH': 'GROQ_1',
  'EXTRACTION': 'GOOGLE_AI_1',
  'FACT_CHECK': 'OPENROUTER_1',
  'JUNIOR_DRAFT': 'GROQ_1',
  'SENIOR_EDIT': 'OPENROUTER_2',
  'BIAS_REVIEW': 'MISTRAL_1',
  'LEGAL_REVIEW': 'OPENROUTER_3',
  'COPYRIGHT': 'GROQ_1',
  'SEO_REVIEW': 'MISTRAL_1',
  'CHIEF_EDITOR': 'OPENROUTER_4',
}

// Model overrides for specific agents
const agentModelOverrides: Record<string, string> = {
  'MONITORING': 'llama-3.1-8b-instant',
  'RESEARCH': 'llama-3.3-70b-versatile',
  'EXTRACTION': 'gemini-1.5-flash',
  'FACT_CHECK': 'google/gemini-2.0-flash-thinking-exp:free',
  'JUNIOR_DRAFT': 'llama-3.3-70b-versatile',
  'SENIOR_EDIT': 'google/gemini-2.0-flash-exp:free',
  'BIAS_REVIEW': 'mistral-small-latest',
  'LEGAL_REVIEW': 'google/gemini-2.0-flash-thinking-exp:free',
  'COPYRIGHT': 'llama-3.1-8b-instant',
  'SEO_REVIEW': 'mistral-small-latest',
  'CHIEF_EDITOR': 'google/gemini-2.0-flash-thinking-exp:free',
}

async function callGroqProvider(config: ProviderConfig, prompt: string, temperature: number, maxTokens: number): Promise<ProviderResponse> {
  const groq = new Groq({ apiKey: config.apiKey })
  const response = await groq.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'
  let data
  try {
    data = JSON.parse(content)
  } catch {
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    data = JSON.parse(cleanedContent)
  }

  return {
    data,
    tokensUsed: response.usage?.total_tokens || 0,
    provider: config.name,
    model: config.model
  }
}

async function callGoogleProvider(config: ProviderConfig, prompt: string, temperature: number): Promise<ProviderResponse> {
  const genAI = new GoogleGenerativeAI(config.apiKey!)
  const model = genAI.getGenerativeModel({
    model: config.model,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json'
    }
  })

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(cleanText)

  return {
    data,
    tokensUsed: Math.floor((prompt.length + cleanText.length) / 4),
    provider: config.name,
    model: config.model
  }
}

async function callOpenRouterProvider(config: ProviderConfig, prompt: string, temperature: number, maxTokens: number): Promise<ProviderResponse> {
  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: 'https://openrouter.ai/api/v1'
  })

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'
  let data
  try {
    data = JSON.parse(content)
  } catch {
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    data = JSON.parse(cleanedContent)
  }

  return {
    data,
    tokensUsed: response.usage?.total_tokens || 0,
    provider: config.name,
    model: config.model
  }
}

async function callMistralProvider(config: ProviderConfig, prompt: string, temperature: number, maxTokens: number): Promise<ProviderResponse> {
  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: 'https://api.mistral.ai/v1'
  })

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'
  let data
  try {
    data = JSON.parse(content)
  } catch {
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    data = JSON.parse(cleanedContent)
  }

  return {
    data,
    tokensUsed: response.usage?.total_tokens || 0,
    provider: config.name,
    model: config.model
  }
}

async function callProvider(config: ProviderConfig, prompt: string, temperature: number, maxTokens: number): Promise<ProviderResponse> {
  switch (config.type) {
    case 'groq':
      return await callGroqProvider(config, prompt, temperature, maxTokens)
    case 'google':
      return await callGoogleProvider(config, prompt, temperature)
    case 'openrouter':
      return await callOpenRouterProvider(config, prompt, temperature, maxTokens)
    case 'mistral':
      return await callMistralProvider(config, prompt, temperature, maxTokens)
    default:
      throw new Error(`Unknown provider type: ${config.type}`)
  }
}

export async function callAIProvider(
  agentName: string,
  prompt: string,
  temperature: number = 0.3,
  maxTokens: number = 2000
): Promise<ProviderResponse> {
  const primaryProviderName = agentProviderMapping[agentName]
  const modelOverride = agentModelOverrides[agentName]

  // Get primary provider config
  let primaryConfig = providers.find(p => p.name === primaryProviderName)
  
  // Override model if specified for this agent
  if (primaryConfig && modelOverride) {
    primaryConfig = { ...primaryConfig, model: modelOverride }
  }

  // Try primary provider first
  if (primaryConfig && primaryConfig.apiKey && !isProviderInCooldown(primaryConfig.name)) {
    try {
      console.log(`[${agentName}] Using primary provider: ${primaryConfig.name} with model ${primaryConfig.model}`)
      const response = await callProvider(primaryConfig, prompt, temperature, maxTokens)
      console.log(`[${agentName}] Success with provider: ${response.provider}, model: ${response.model}, tokens: ${response.tokensUsed}`)
      return response
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.warn(`[${agentName}] Primary provider ${primaryConfig.name} hit rate limit, marking cooldown`)
        markProviderCooldown(primaryConfig.name)
      } else {
        console.error(`[${agentName}] Primary provider ${primaryConfig.name} failed:`, error.message)
      }
    }
  } else if (!primaryConfig?.apiKey) {
    console.warn(`[${agentName}] Primary provider ${primaryProviderName} has no API key, skipping to fallback`)
  }

  // Try fallback providers in order
  for (const fallbackName of fallbackOrder) {
    if (fallbackName === primaryProviderName) continue // Skip primary if we already tried it
    
    const fallbackConfig = providers.find(p => p.name === fallbackName)
    if (!fallbackConfig?.apiKey) {
      console.warn(`[${agentName}] Fallback provider ${fallbackName} has no API key, skipping`)
      continue
    }

    if (isProviderInCooldown(fallbackName)) {
      console.warn(`[${agentName}] Fallback provider ${fallbackName} is in cooldown, skipping`)
      continue
    }

    try {
      console.log(`[${agentName}] Trying fallback provider: ${fallbackName} with model ${fallbackConfig.model}`)
      const response = await callProvider(fallbackConfig, prompt, temperature, maxTokens)
      console.log(`[${agentName}] Success with fallback provider: ${response.provider}, model: ${response.model}, tokens: ${response.tokensUsed}`)
      return response
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.warn(`[${agentName}] Fallback provider ${fallbackName} hit rate limit, marking cooldown`)
        markProviderCooldown(fallbackName)
      } else {
        console.error(`[${agentName}] Fallback provider ${fallbackName} failed:`, error.message)
      }
    }
  }

  // Last resort: try old Gemini keys if available
  const oldGeminiKeys = [process.env.GEMINI_KEY_1, process.env.GEMINI_KEY_2].filter(Boolean)
  for (const oldKey of oldGeminiKeys) {
    try {
      console.log(`[${agentName}] Trying old Gemini key as last resort`)
      const genAI = new GoogleGenerativeAI(oldKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature, responseMimeType: 'application/json' }
      })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const data = JSON.parse(cleanText)
      
      console.log(`[${agentName}] Success with old Gemini key, tokens: ~${(prompt.length + cleanText.length) / 4}`)
      return {
        data,
        tokensUsed: Math.floor((prompt.length + cleanText.length) / 4),
        provider: 'OLD_GEMINI',
        model: 'gemini-1.5-flash'
      }
    } catch (error: any) {
      console.error(`[${agentName}] Old Gemini key failed:`, error.message)
    }
  }

  throw new Error(`[${agentName}] All providers failed. No available API keys or all providers in cooldown.`)
}
