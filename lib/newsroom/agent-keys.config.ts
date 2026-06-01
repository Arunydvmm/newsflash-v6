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
    backup:  { key: process.env.GOOGLE_AI_KEY_1!,  provider: 'google',     model: 'gemini-1.5-flash' }
  },

  // Agent 3 — WRITE (solo — heaviest task, needs full token budget)
  // OpenRouter KEY_1 primary, KEY_2 backup — two independent accounts
  WRITE: {
    primary: { key: process.env.OPENROUTER_KEY_1!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
    backup:  { key: process.env.OPENROUTER_KEY_2!, provider: 'openrouter', model: 'google/gemma-2-9b-it:free' }
  },

  // Agent 4 — REVIEW (safety + seo + polish merged)
  // OpenRouter KEY_3 primary — thinking model for safety
  // Mistral backup — excellent at SEO/polish tasks
  REVIEW: {
    primary: { key: process.env.OPENROUTER_KEY_3!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
    backup:  { key: process.env.MISTRAL_KEY_1!,    provider: 'mistral',    model: 'mistral-small-latest' }
  },

  // Agent 5 — CHIEF (final editorial gate)
  // Nvidia PRIMARY — nemotron reasoning model with 65k tokens
  // This is your most powerful model — perfect for final decision
  // OpenRouter KEY_4 backup
  CHIEF: {
    primary: { key: process.env.NVIDIA_API_KEY!,   provider: 'nvidia',     model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning' },
    backup:  { key: process.env.OPENROUTER_KEY_4!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' }
  }
}

// Last resort — if ALL above fail
export const FALLBACK_KEYS = [
  { key: process.env.GEMINI_KEY_1!, provider: 'google_legacy', model: 'gemini-2.0-flash' },
  { key: process.env.GEMINI_KEY_2!, provider: 'google_legacy', model: 'gemini-2.0-flash' }
]

export const KEY_SHARING_MAP: Record<string, string[]> = {
  'GROQ_KEY_1':       ['SCOUT_primary', 'EXTRACT_backup_of_KEY1'],
  'GROQ_KEY_2':       ['EXTRACT_primary', 'SCOUT_backup'],
  'OPENROUTER_KEY_1': ['WRITE_primary'],
  'OPENROUTER_KEY_2': ['WRITE_backup'],
  'OPENROUTER_KEY_3': ['REVIEW_primary'],
  'OPENROUTER_KEY_4': ['CHIEF_backup'],
  'GOOGLE_AI_KEY_1':  ['EXTRACT_backup'],
  'MISTRAL_KEY_1':    ['REVIEW_backup'],
  'NVIDIA_API_KEY':   ['CHIEF_primary'],
  'GEMINI_KEY_1':     ['FALLBACK_1'],
  'GEMINI_KEY_2':     ['FALLBACK_2']
}
