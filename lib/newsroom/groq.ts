I have a Next.js 14 project using MongoDB + Mongoose.
Create ONE new file only: /lib/newsroom/groq.ts

My project already uses Groq in /app/api/sarkari/ai-detail/route.ts
Follow the exact same fetch pattern.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3,
  maxTokens = 2000
): Promise<any> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens
        })
      })
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 30000))
        continue
      }
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || ''
      const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      return JSON.parse(clean)
    } catch (err: any) {
      if (attempt === 3) return { error: err.message }
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

Do not touch any existing files.