import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

interface GroqResponse {
  data: any
  tokensUsed: number
}

class RateLimiter {
  private queue: Array<() => void> = []
  private processing = false
  private lastRequestTime = 0
  private minInterval = 2000 // 30 req/min = 2s between requests

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
      if (error.status === 429 || error.status === 413) {
        // Rate limit or payload too large
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

export async function callGroq(
  prompt: string,
  temperature = 0.3,
  maxTokens = 2000
): Promise<GroqResponse> {
  return new Promise((resolve, reject) => {
    rateLimiter.schedule(async () => {
      try {
        const startTime = Date.now()
        const response = await callWithRetry(() =>
          groq.chat.completions.create({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' }
          })
        )

        const content = response.choices[0]?.message?.content || '{}'
        const data = JSON.parse(content)
        const processingMs = Date.now() - startTime
        const tokensUsed = response.usage?.total_tokens || 0

        // Log token usage
        console.log(`[Groq] Tokens: ${tokensUsed}, Time: ${processingMs}ms`)

        resolve({ data, tokensUsed })
      } catch (error) {
        reject(error)
      }
    })
  })
}

export async function callGroqFast(
  prompt: string,
  temperature = 0.3,
  maxTokens = 1000
): Promise<GroqResponse> {
  return new Promise((resolve, reject) => {
    rateLimiter.schedule(async () => {
      try {
        const startTime = Date.now()
        const response = await callWithRetry(() =>
          groq.chat.completions.create({
            model: process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: 'You are a helpful AI assistant. Always respond with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' }
          })
        )

        const content = response.choices[0]?.message?.content || '{}'
        const data = JSON.parse(content)
        const processingMs = Date.now() - startTime
        const tokensUsed = response.usage?.total_tokens || 0

        // Log token usage
        console.log(`[Groq Fast] Tokens: ${tokensUsed}, Time: ${processingMs}ms`)

        resolve({ data, tokensUsed })
      } catch (error) {
        reject(error)
      }
    })
  })
}
