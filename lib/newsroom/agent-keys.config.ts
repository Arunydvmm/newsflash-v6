export const AGENT_KEYS = {
  MONITOR: {
    primary: { key: process.env.GROQ_KEY_1!,        provider: 'groq',       model: 'llama-3.1-8b-instant' },
    backup:  { key: process.env.GROQ_KEY_1!,        provider: 'groq',       model: 'llama-3.1-8b-instant' }
  },
  RESEARCH: {
    primary: { key: process.env.GROQ_KEY_1!,        provider: 'groq',       model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.OPENROUTER_KEY_4!,  provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' }
  },
  EXTRACT_VERIFY: {
    primary: { key: process.env.GOOGLE_AI_KEY_1!,   provider: 'google',     model: 'gemini-1.5-flash' },
    backup:  { key: process.env.OPENROUTER_KEY_3!,  provider: 'openrouter', model: 'google/gemini-2.0-flash-exp:free' }
  },
  WRITE: {
    primary: { key: process.env.OPENROUTER_KEY_1!,  provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
    backup:  { key: process.env.OPENROUTER_KEY_2!,  provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' }
  },
  SAFETY: {
    primary: { key: process.env.OPENROUTER_KEY_3!,  provider: 'openrouter', model: 'google/gemini-2.0-flash-thinking-exp:free' },
    backup:  { key: process.env.OPENROUTER_KEY_4!,  provider: 'openrouter', model: 'google/gemini-2.0-flash-thinking-exp:free' }
  },
  SEO_POLISH: {
    primary: { key: process.env.MISTRAL_KEY_1!,     provider: 'mistral',    model: 'mistral-small-latest' },
    backup:  { key: process.env.GROQ_KEY_1!,        provider: 'groq',       model: 'llama-3.3-70b-versatile' }
  },
  CHIEF_EDITOR: {
    primary: { key: process.env.OPENROUTER_KEY_2!,  provider: 'openrouter', model: 'google/gemini-2.0-flash-thinking-exp:free' },
    backup:  { key: process.env.GOOGLE_AI_KEY_1!,   provider: 'google',     model: 'gemini-1.5-pro' }
  }
}

export const FALLBACK_KEYS = [
  { key: process.env.GEMINI_KEY_1!, provider: 'google_legacy', model: 'gemini-2.0-flash' },
  { key: process.env.GEMINI_KEY_2!, provider: 'google_legacy', model: 'gemini-2.0-flash' }
]

export const KEY_SHARING_MAP: Record<string, string[]> = {
  'GROQ_KEY_1':       ['MONITOR_primary', 'MONITOR_backup', 'RESEARCH_primary', 'SEO_POLISH_backup'],
  'OPENROUTER_KEY_1': ['WRITE_primary'],
  'OPENROUTER_KEY_2': ['WRITE_backup', 'CHIEF_EDITOR_primary'],
  'OPENROUTER_KEY_3': ['EXTRACT_VERIFY_backup', 'SAFETY_primary'],
  'OPENROUTER_KEY_4': ['RESEARCH_backup', 'SAFETY_backup'],
  'GOOGLE_AI_KEY_1':  ['EXTRACT_VERIFY_primary', 'CHIEF_EDITOR_backup'],
  'MISTRAL_KEY_1':    ['SEO_POLISH_primary'],
  'GEMINI_KEY_1':     ['FALLBACK_1'],
  'GEMINI_KEY_2':     ['FALLBACK_2']
}
