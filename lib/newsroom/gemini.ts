import { GoogleGenerativeAI } from '@google/generative-ai'

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3
): Promise<any> {
  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY!
  )
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro',
    generationConfig: {
      temperature,
      responseMimeType: 'application/json'
    },
    systemInstruction: systemPrompt
  })
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(userPrompt)
      const text = result.response.text()
      const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      return JSON.parse(clean)
    } catch (err: any) {
      if (attempt === 3) return { error: err.message }
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}