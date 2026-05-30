import { GoogleGenerativeAI } from '@google/generative-ai'
import { callGroq } from './groq.service'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY!)

interface GeminiResponse {
  data: any
  tokensUsed: number
}

class RateLimiter {
  private queue: Array<() => void> = []
  private processing = false
  private lastRequestTime = 0
  private minInterval = 4000 // 15 req/min = 4s between requests

  async schedule(fn: () => void): Promise<void> {
    this.queue.push(fn)
    if (!this.processing) {
      this.process()
    }
  }

  private async process(): Promise<void> {
    this.processing = true
    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest))
      }
      const fn = this.queue.shift()!
      await fn()
      this.lastRequestTime = Date.now()
    }
    this.processing = false
  }
}

const rateLimiter = new RateLimiter()

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limit - wait 60s
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 60000))
          continue
        }
      }
      if (error.status === 503) {
        // Service unavailable - retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

export async function callGeminiPro(
  prompt: string,
  temperature = 0.3
): Promise<GeminiResponse> {
  return new Promise((resolve, reject) => {
    rateLimiter.schedule(async () => {
      try {
        const startTime = Date.now()
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro',
          generationConfig: {
            temperature,
            responseMimeType: 'application/json'
          }
        })

        const result = await callWithRetry(() => model.generateContent(prompt))
        const text = result.response.text()
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const data = JSON.parse(cleanText)
        const processingMs = Date.now() - startTime

        // Log token usage (approximate)
        console.log(`[Gemini Pro] Tokens: ~${prompt.length / 4 + cleanText.length / 4}, Time: ${processingMs}ms`)

        resolve({
          data,
          tokensUsed: Math.floor((prompt.length + cleanText.length) / 4)
        })
      } catch (error: any) {
        // Fallback to Groq if Google AI quota exceeded
        if (error.status === 429 || error.message?.includes('quota')) {
          console.warn('[Gemini Pro] Quota exceeded, falling back to Groq')
          try {
            const groqResponse = await callGroq(prompt, temperature, 2000)
            resolve(groqResponse)
          } catch (groqError) {
            reject(error)
          }
        } else {
          reject(error)
        }
      }
    })
  })
}

export async function callGeminiFlash(
  prompt: string,
  temperature = 0.3
): Promise<GeminiResponse> {
  return new Promise((resolve, reject) => {
    rateLimiter.schedule(async () => {
      try {
        const startTime = Date.now()
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash',
          generationConfig: {
            temperature,
            responseMimeType: 'application/json'
          }
        })

        const result = await callWithRetry(() => model.generateContent(prompt))
        const text = result.response.text()
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const data = JSON.parse(cleanText)
        const processingMs = Date.now() - startTime

        // Log token usage
        console.log(`[Gemini Flash] Tokens: ~${prompt.length / 4 + cleanText.length / 4}, Time: ${processingMs}ms`)

        resolve({
          data,
          tokensUsed: Math.floor((prompt.length + cleanText.length) / 4)
        })
      } catch (error: any) {
        // Fallback to Groq if Google AI quota exceeded
        if (error.status === 429 || error.message?.includes('quota')) {
          console.warn('[Gemini Flash] Quota exceeded, falling back to Groq')
          try {
            const groqResponse = await callGroq(prompt, temperature, 2000)
            resolve(groqResponse)
          } catch (groqError) {
            reject(error)
          }
        } else {
          reject(error)
        }
      }
    })
  })
}
