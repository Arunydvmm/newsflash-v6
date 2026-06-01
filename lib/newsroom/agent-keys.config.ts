export const AGENT_KEYS = {
  // Agent 1 — SCOUT (monitor + research merged)
  // Groq KEY_1 primary — fast 70b for selection and research
  SCOUT: {
    primary: { key: process.env.GROQ_KEY_1!,       provider: 'groq',       model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.GROQ_KEY_2!,       provider: 'groq',       model: 'llama-3.3-70b-versatile' }
  },

  // Agent 2 — EXTRACT (extract + verify — solo critical stage)
  // Groq KEY_2 primary — structured JSON extraction
  EXTRACT: {
    primary: { key: process.env.GROQ_KEY_2!,       provider: 'groq',       model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.GOOGLE_AI_KEY_1!,  provider: 'google',     model: 'gemini-2.0-flash' }
  },

  // Agent 3 — WRITE (solo — heaviest task, needs full token budget)
  // Groq KEY_1 primary, KEY_2 backup — use Groq instead of OpenRouter free models
  WRITE: {
    primary: { key: process.env.GROQ_KEY_1!,       provider: 'groq',       model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.GROQ_KEY_2!,       provider: 'groq',       model: 'llama-3.3-70b-versatile' }
  },

  // Agent 4 — REVIEW (safety + seo + polish merged)
  // Mistral primary — excellent at SEO/polish tasks
  // Google backup — fallback for safety review
  REVIEW: {
    primary: { key: process.env.MISTRAL_KEY_1!,    provider: 'mistral',    model: 'mistral-small-latest' },
    backup:  { key: process.env.GOOGLE_AI_KEY_1!,  provider: 'google',     model: 'gemini-2.0-flash' }
  },

  // Agent 5 — CHIEF (final editorial gate)
  // Nvidia PRIMARY — nemotron reasoning model with 65k tokens
  // Mistral backup — fallback for final decision
  CHIEF: {
    primary: { key: process.env.NVIDIA_API_KEY!,   provider: 'nvidia',     model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning' },
    backup:  { key: process.env.MISTRAL_KEY_1!,    provider: 'mistral',    model: 'mistral-small-latest' }
  }
}

// Last resort — if ALL above fail
export const FALLBACK_KEYS = [
  { key: process.env.GEMINI_KEY_1!, provider: 'google_legacy', model: 'gemini-2.0-flash' },
  { key: process.env.GEMINI_KEY_2!, provider: 'google_legacy', model: 'gemini-2.0-flash' }
]

export const KEY_SHARING_MAP: Record<string, string[]> = {
  'GROQ_KEY_1':       ['SCOUT_primary', 'WRITE_primary'],
  'GROQ_KEY_2':       ['EXTRACT_primary', 'SCOUT_backup', 'WRITE_backup'],
  'GOOGLE_AI_KEY_1':  ['EXTRACT_backup', 'REVIEW_backup'],
  'MISTRAL_KEY_1':    ['REVIEW_primary', 'CHIEF_backup'],
  'NVIDIA_API_KEY':   ['CHIEF_primary'],
  'GEMINI_KEY_1':     ['FALLBACK_1'],
  'GEMINI_KEY_2':     ['FALLBACK_2']
}
