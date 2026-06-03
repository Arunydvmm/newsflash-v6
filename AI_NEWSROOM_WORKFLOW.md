# 🤖 AI NEWSROOM - COMPLETE WORKFLOW DOCUMENTATION

## Table of Contents
1. System Overview
2. Complete Workflow Diagram
3. Stage-by-Stage Breakdown
4. API Keys & Models
5. Data Flow
6. Configuration Details
7. Error Handling
8. Token Budget

---

## 1. SYSTEM OVERVIEW

### What is AI Newsroom?
An **automated news generation pipeline** that:
- Fetches articles from RSS feeds
- Evaluates newsworthiness
- Extracts key information
- Generates publication-ready content
- Reviews for safety and quality
- Saves to database for editorial review

### Architecture: 5-Agent System
Instead of 11 separate agents, NewsFlash v6 uses 5 **intelligent, merged agents**:

| Agent | Function | Models Used |
|-------|----------|------------|
| 1️⃣ **SCOUT** | Monitor + Research | Groq, Google Gemini |
| 2️⃣ **EXTRACT** | Extract + Verify | Groq, Google Gemini |
| 3️⃣ **WRITE** | Draft + Edit | OpenRouter, Groq |
| 4️⃣ **REVIEW** | Safety + SEO | Google Gemini, OpenRouter |
| 5️⃣ **CHIEF** | Editorial Decision | Nvidia, Mistral, OpenRouter |

---

## 2. COMPLETE WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DAILY SCHEDULED TASK                           │
│                    (1 article per day max)                          │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: RSS FEED FETCHING                                           │
│ ────────────────────────────────────────────────────────────────────│
│ • Fetches from 10 RSS sources                                      │
│ • Parses XML for: headline, snippet, source, date                │
│ • Deduplicates by headline                                        │
│ • Returns top articles scored by newsworthiness                   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: SCHEDULER (Article Selection)                              │
│ ────────────────────────────────────────────────────────────────────│
│ • Checks daily limit: MAX_ARTICLES_PER_DAY = 1                   │
│ • Scores each article (1-10 scale)                                │
│ • Selects TOP 1 article                                           │
│ • Creates watchlist entry                                         │
│ • Queues for processing                                           │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: PIPELINE QUEUE                                              │
│ ────────────────────────────────────────────────────────────────────│
│ • Article added to NfPipelineJob table                            │
│ • Status: QUEUED                                                  │
│ • Waits for available slot (max 1 concurrent)                     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: PIPELINE ENGINE STARTS                                      │
│ ────────────────────────────────────────────────────────────────────│
│ • Reserves slot (MAX_SLOTS = 1)                                   │
│ • Status: RUNNING                                                 │
│ • Begins stage processing                                         │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 1: SCOUT AGENT (Monitoring + Research)                        │
│ ────────────────────────────────────────────────────────────────────│
│ MODEL USED: Groq API (Primary), Google Gemini (Backup)            │
│ API KEYS: GROQ_KEY_1, GOOGLE_GEMINI_KEY                           │
│ MAX TOKENS: 800                                                    │
│ TIMEOUT: 10 seconds                                                │
│                                                                    │
│ INPUT:                                                             │
│   • Headline: "${headline}"                                       │
│   • Snippet: "${contentSnippet.slice(0,400)}"                    │
│   • Source: "${sourceName}"                                       │
│   • Published: "${publishedAt}"                                   │
│                                                                    │
│ AGENT TASK:                                                        │
│   1. Score newsworthiness (1-10)                                  │
│   2. Detect fake news signals                                     │
│   3. Classify category (POLITICS|BUSINESS|TECH|...)              │
│   4. Assign priority (URGENT|HIGH|STANDARD|LOW)                  │
│   5. Extract 5 Ws (WHO, WHAT, WHEN, WHERE, WHY)                 │
│   6. List verifiable claims with confidence                       │
│   7. Assess source credibility (HIGH|MEDIUM|LOW)                 │
│                                                                    │
│ OUTPUT (JSON):                                                     │
│   {                                                                │
│     "monitor": {                                                  │
│       "newsworthinessScore": 7,                                   │
│       "isFakeNewsRisk": false,                                    │
│       "category": "POLITICS",                                     │
│       "priority": "HIGH"                                          │
│     },                                                             │
│     "research": {                                                 │
│       "fiveWs": {...},                                            │
│       "verifiableClaims": [...],                                  │
│       "sourceCredibility": "HIGH"                                 │
│     },                                                             │
│     "confidence": 0.75                                            │
│   }                                                                │
│                                                                    │
│ DECISION:                                                          │
│   ✅ PROCEED if score >= 2 (lenient for testing)                 │
│   ❌ BLOCK if score < 2 or fake news detected                    │
│                                                                    │
│ TIME: ~940ms                                                       │
│ TOKENS: 800 (Groq budget)                                         │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 2: EXTRACT AGENT (Data Extraction + Verification)            │
│ ────────────────────────────────────────────────────────────────────│
│ MODEL USED: Groq API (Primary), Google Gemini (Backup)            │
│ API KEYS: GROQ_KEY_2, GOOGLE_GEMINI_KEY                           │
│ MAX TOKENS: 700                                                    │
│ TIMEOUT: 10 seconds                                                │
│                                                                    │
│ INPUT:                                                             │
│   • Scout report (from Stage 1)                                   │
│   • Original headline                                             │
│   • Original snippet                                              │
│                                                                    │
│ AGENT TASK:                                                        │
│   1. Extract structured schema                                    │
│   2. Verify each field                                            │
│   3. Calculate fact score (0.0-1.0)                              │
│   4. Flag problematic fields                                      │
│   5. Assess overall verification (VERIFIED|PARTIAL|FAILED)      │
│                                                                    │
│ EXTRACTED SCHEMA:                                                  │
│   {                                                                │
│     "headline": "max 70 chars",                                   │
│     "subheadline": "max 120 chars",                               │
│     "keyPeople": [{"name": "", "role": ""}],                     │
│     "importantDates": [{"date": "", "significance": ""}],        │
│     "locations": [],                                              │
│     "statistics": [{"value": "", "context": ""}],                │
│     "officialSources": [],                                        │
│     "summary": "2 sentences max"                                  │
│   }                                                                │
│                                                                    │
│ OUTPUT (JSON):                                                     │
│   {                                                                │
│     "schema": {...},                                              │
│     "verification": {                                             │
│       "factScore": 0.75,                                          │
│       "flaggedFields": [],                                        │
│       "overallVerification": "VERIFIED"                           │
│     },                                                             │
│     "confidence": 0.8                                             │
│   }                                                                │
│                                                                    │
│ DECISION:                                                          │
│   ✅ PROCEED if factScore >= 0.30 (lenient)                      │
│   ❌ BLOCK if factScore < 0.30                                   │
│                                                                    │
│ TIME: ~1200ms                                                      │
│ TOKENS: 700 (Groq budget)                                         │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 3: WRITE AGENT (Junior Draft + Senior Edit)                  │
│ ────────────────────────────────────────────────────────────────────│
│ MODEL USED: OpenRouter (Primary), Groq (Backup)                   │
│ API KEYS: OPENROUTER_API_KEY, GROQ_API_KEY                        │
│ MAX TOKENS: 3000 (largest budget)                                  │
│ TIMEOUT: 15 seconds                                                │
│                                                                    │
│ INPUT:                                                             │
│   • Verified schema from Extract                                  │
│   • Original headline                                             │
│   • Original snippet                                              │
│                                                                    │
│ AGENT TASK:                                                        │
│   1. Generate publication-ready article                           │
│   2. Structure: inverted pyramid                                  │
│   3. Length: 500-2000 words                                       │
│   4. Mobile-friendly: short paragraphs (max 3 sentences)          │
│   5. Add subheadings (##) every 3-4 paragraphs                   │
│   6. Include table OR timeline OR statistics OR bullet points    │
│   7. Generate SEO metadata                                        │
│   8. Create URL slug                                              │
│                                                                    │
│ OUTPUT (JSON):                                                     │
│   {                                                                │
│     "article": {                                                  │
│       "headline": "Publication-ready headline",                   │
│       "subheadline": "Engaging subheadline",                      │
│       "body": "Full markdown article with subheadings",           │
│       "metaTitle": "SEO title (<60 chars)",                       │
│       "metaDescription": "SEO description (<160 chars)",          │
│       "tags": ["tag1", "tag2"],                                   │
│       "slug": "url-friendly-slug"                                 │
│     },                                                             │
│     "wordCount": 1247,                                            │
│     "tablesIncluded": 1,                                          │
│     "confidence": 0.8                                             │
│   }                                                                │
│                                                                    │
│ FALLBACK GENERATION:                                               │
│   If schema is empty:                                              │
│   • Uses original headline and snippet                            │
│   • Creates minimal article structure                             │
│   • Still returns valid JSON                                      │
│                                                                    │
│ DECISION:                                                          │
│   ✅ ALWAYS PROCEED (let Review/Chief decide)                     │
│   ❌ No blocking at this stage                                    │
│                                                                    │
│ TIME: ~2800ms                                                      │
│ TOKENS: 3000 (OpenRouter free tier)                               │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 4: REVIEW AGENT (Bias + Legal + Copyright)                   │
│ ────────────────────────────────────────────────────────────────────│
│ MODEL USED: Google Gemini (Primary), OpenRouter (Backup)          │
│ API KEYS: GOOGLE_GEMINI_KEY, OPENROUTER_API_KEY                  │
│ MAX TOKENS: 1000                                                   │
│ TIMEOUT: 15 seconds                                                │
│                                                                    │
│ INPUT:                                                             │
│   • Generated article                                             │
│   • Article headline                                              │
│   • First 1500 chars of body                                      │
│                                                                    │
│ AGENT TASK:                                                        │
│   1. Check for bias (score 0.0-1.0)                              │
│   2. Assess legal risks (CLEAR|CAUTION|BLOCKED)                  │
│   3. Check copyright similarity (0.0-1.0)                         │
│   4. Generate SEO metadata                                        │
│   5. Check mobile formatting                                      │
│   6. Fix grammar/spelling issues                                  │
│   7. Verify number formatting (lakh/crore not million/billion)   │
│                                                                    │
│ OUTPUT (JSON):                                                     │
│   {                                                                │
│     "safety": {                                                   │
│       "biasScore": 0.3,                                           │
│       "legalRisk": "CLEAR",                                       │
│       "copyrightScore": 0.1,                                      │
│       "overallSafe": true                                         │
│     },                                                             │
│     "seo": {                                                      │
│       "metaTitle": "...",                                         │
│       "metaDescription": "...",                                   │
│       "slug": "...",                                              │
│       "primaryKeyword": "..."                                     │
│     },                                                             │
│     "confidence": 0.75                                            │
│   }                                                                │
│                                                                    │
│ BLOCK CONDITIONS:                                                  │
│   ❌ bias > 0.85 (extremely biased)                               │
│   ❌ legalRisk = CRITICAL                                         │
│   ❌ copyrightScore > 0.25                                        │
│                                                                    │
│ CURRENT STATUS:                                                    │
│   ⚠️ GOOGLE GEMINI QUOTA EXCEEDED                                 │
│   → Gracefully skipped, article continues                         │
│                                                                    │
│ TIME: ~3000ms (if available)                                       │
│ TOKENS: 1000 (Google quota: 0% remaining)                         │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 5: CHIEF AGENT (SEO + Editorial Decision)                    │
│ ────────────────────────────────────────────────────────────────────│
│ MODEL USED: Nvidia (Primary), Mistral (Backup), OpenRouter (3rd)  │
│ API KEYS: NVIDIA_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY    │
│ MAX TOKENS: 800                                                    │
│ TIMEOUT: 15 seconds                                                │
│                                                                    │
│ INPUT:                                                             │
│   • All previous stage reports                                    │
│   • Article headline                                              │
│   • Processing scores from each stage                             │
│                                                                    │
│ AGENT TASK:                                                        │
│   1. Receive all stage confidence scores                          │
│   2. Apply editorial grading formula                              │
│   3. Assign grade: A|B|C|REWRITE|REJECT                          │
│   4. Make publishing decision                                     │
│   5. Generate final tags and category                             │
│   6. Suggest scheduling (immediate|morning|evening)              │
│                                                                    │
│ GRADING FORMULA (For Testing):                                     │
│   Grade A: all scores > 0.75, wordCount 800+, safety passed     │
│   Grade B: all scores > 0.50, wordCount 500+, safety passed     │
│   Grade C: any score 0.5-0.65 → HOLD_FOR_REVIEW                │
│   REWRITE: wordCount < 500 OR extract score < 0.35              │
│   REJECT: safety failed OR critical blocks                       │
│                                                                    │
│ OUTPUT (JSON):                                                     │
│   {                                                                │
│     "editorialGrade": "B",                                        │
│     "overallScore": 8.0,                                          │
│     "decision": "PUBLISH_NOW",                                    │
│     "finalCategory": "POLITICS",                                  │
│     "finalTags": ["india", "politics"],                          │
│     "scheduleSuggestion": "morning",                              │
│     "editorNotes": "..."                                          │
│   }                                                                │
│                                                                    │
│ DECISIONS:                                                         │
│   ✅ PUBLISH_NOW: Grade A or B → Article saved as DRAFT_READY   │
│   ⏸️ HOLD_FOR_REVIEW: Grade C → Manual review needed             │
│   🔄 REWRITE: Needs improvement → Sent back                      │
│   ❌ REJECT: Quality issues → Not saved                           │
│                                                                    │
│ CURRENT STATUS:                                                    │
│   ⚠️ API KEYS LIMITED/EXCEEDED                                    │
│   → Uses default Grade B (article saved anyway)                   │
│                                                                    │
│ TIME: ~2500ms (if available)                                       │
│ TOKENS: 800 (various providers)                                    │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: ARTICLE SAVING                                              │
│ ────────────────────────────────────────────────────────────────────│
│ • Creates NfArticle record in database                            │
│ • Status: DRAFT_READY (waiting for editorial approval)           │
│ • Stores: title, content, metadata, scores, reports              │
│ • Links: to NfPipelineJob for tracking                           │
│ • Updates: pipeline job status to COMPLETED                      │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: PIPELINE COMPLETION                                         │
│ ────────────────────────────────────────────────────────────────────│
│ • Frees slot (MAX_SLOTS = 1)                                      │
│ • Marks job: COMPLETED                                            │
│ • Saves processing time: 45 seconds total                         │
│ • Logs all reports and metrics                                    │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: EDITORIAL WORKFLOW                                          │
│ ────────────────────────────────────────────────────────────────────│
│ Article appears in: Admin Newsroom → AI Drafts                    │
│ Editor can:                                                        │
│   • Review generated content                                      │
│   • Edit title, content, metadata                                 │
│   • Approve and publish                                           │
│   • Reject and request regeneration                               │
│   • Schedule for specific time                                    │
└─────────────────────────────────────────────────────────────────────┘

---

## 3. API KEYS & CONFIGURATION

### Groq API (Primary for SCOUT & EXTRACT)
```
PROVIDER:       Groq (Fast inference)
ENDPOINT:       https://api.groq.com/openai/v1
KEY_1 (SCOUT):  GROQ_API_KEY_1
KEY_2 (EXTRACT): GROQ_API_KEY_2
MODELS:         mixtral-8x7b-32768, llama-2-70b-chat
RATE LIMIT:     ~100 requests/minute
BUDGET:         100,000 tokens/day per key
CURRENT USAGE:  ~1,500 tokens/day (1 article)
```

### Google Gemini (Backup for SCOUT/EXTRACT, Primary for REVIEW)
```
PROVIDER:       Google AI Studio
ENDPOINT:       https://generativelanguage.googleapis.com/v1beta/models
KEY:            GOOGLE_GEMINI_API_KEY
MODELS:         gemini-2.0-flash, gemini-pro-vision
RATE LIMIT:     Free tier: 60 requests/minute
BUDGET:         Free tier: 1,500 requests/day
CURRENT STATUS: ⚠️ QUOTA EXCEEDED (0% remaining)
COST:           Free tier exceeded
SOLUTION:       Upgrade to paid plan OR wait for daily reset
```

### OpenRouter (Backup for WRITE, Backup for REVIEW)
```
PROVIDER:       OpenRouter (Multi-model provider)
ENDPOINT:       https://openrouter.ai/api/v1
KEY:            OPENROUTER_API_KEY
MODELS:         auto (best available model selection)
RATE LIMIT:     Depends on plan
BUDGET:         Based on subscription
COST:           Free tier available
CURRENT STATUS: ✅ WORKING
TOKENS USED:    Free tier (unlimited for free users)
```

### Nvidia (Primary for CHIEF)
```
PROVIDER:       Nvidia NIM (Inference Microservices)
ENDPOINT:       https://integrate.api.nvidia.com/v1
KEY:            NVIDIA_API_KEY
MODELS:         mixtral-8x7b, llama-2-70b
RATE LIMIT:     Based on tier
BUDGET:         Free tier available
CURRENT STATUS: ⚠️ NOT CONFIGURED
SOLUTION:       Add NVIDIA_API_KEY to environment variables
```

### Mistral (Backup for CHIEF)
```
PROVIDER:       Mistral AI
ENDPOINT:       https://api.mistral.ai/v1
KEY:            MISTRAL_API_KEY
MODELS:         mistral-small, mistral-medium, mistral-large
RATE LIMIT:     Depends on plan
BUDGET:         400 tokens/day (free tier)
CURRENT STATUS: ⚠️ BUDGET EXCEEDED (free tier)
SOLUTION:       Upgrade plan OR wait for daily reset
```

---

## 4. TOKEN BUDGET BREAKDOWN

### Daily Token Allocation (Per 1 Article)

```
┌─────────────────────────────────────────────────────────────┐
│                    STAGE 1: SCOUT                           │
├─────────────────────────────────────────────────────────────┤
│ Provider:      Groq KEY_1                                  │
│ Tokens:        800                                          │
│ Budget:        100,000/day                                 │
│ Usage:         0.8% ✅                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   STAGE 2: EXTRACT                          │
├─────────────────────────────────────────────────────────────┤
│ Provider:      Groq KEY_2                                  │
│ Tokens:        700                                          │
│ Budget:        100,000/day                                 │
│ Usage:         0.7% ✅                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STAGE 3: WRITE                           │
├─────────────────────────────────────────────────────────────┤
│ Provider:      OpenRouter                                  │
│ Tokens:        3,000                                        │
│ Budget:        Free tier                                   │
│ Usage:         ∞ (unlimited) ✅                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   STAGE 4: REVIEW                           │
├─────────────────────────────────────────────────────────────┤
│ Provider:      Google Gemini (Primary)                     │
│ Tokens:        1,000                                        │
│ Budget:        1,500/day (free tier)                       │
│ Usage:         ⚠️ EXCEEDED (quota issues)                  │
│ Fallback:      OpenRouter (unlimited)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STAGE 5: CHIEF                           │
├─────────────────────────────────────────────────────────────┤
│ Provider:      Nvidia (Primary)                            │
│ Tokens:        800                                          │
│ Budget:        Free tier                                   │
│ Usage:         ⚠️ NOT CONFIGURED                           │
│ Fallback:      Mistral (400/day) ⚠️ EXCEEDED             │
│ Fallback 2:    OpenRouter (unlimited) ✅                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DAILY TOTALS                              │
├─────────────────────────────────────────────────────────────┤
│ Total Tokens:           ~6,300 tokens/article              │
│ With 1 article/day:     ~6,300 tokens/day                  │
│ With 5 articles/day:    ~31,500 tokens/day (old config)   │
│ Groq Budget Remaining:  ~93,700 tokens (healthy) ✅        │
│ Google Quota Remaining: 0 tokens (exceeded) ⚠️             │
│ OpenRouter Remaining:   ∞ (unlimited) ✅                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. FALLBACK CHAIN & ERROR HANDLING

### Provider Fallback Order

```
STAGE 1 (SCOUT):
1. Try: Groq KEY_1 (primary)
   ├─ Success → Use result
   └─ Fail (budget) → Next

2. Try: Google Gemini (backup)
   ├─ Success → Use result
   └─ Fail (quota) → Next

3. Fallback: Skip stage, use defaults
   └─ Continue to next stage

STAGE 2 (EXTRACT):
1. Try: Groq KEY_2
2. Try: Google Gemini
3. Fallback: Skip stage

STAGE 3 (WRITE):
1. Try: OpenRouter
2. Try: Groq (fallback)
3. Fallback: Generate from source data

STAGE 4 (REVIEW):
1. Try: Google Gemini
2. Try: OpenRouter
3. Fallback: Skip review, use defaults

STAGE 5 (CHIEF):
1. Try: Nvidia (not configured)
2. Try: Mistral (budget exceeded)
3. Try: OpenRouter
4. Fallback: Use default Grade B
```

---

## 6. RATE LIMITING & RETRY LOGIC

### Rate Limit Handling

```
If Status 429 (Rate Limited):
1. Parse Retry-After header
2. If wait < 30 minutes:
   → Sleep for specified duration
   → Retry same provider
3. If wait > 30 minutes:
   → Skip to next provider
   → Don't wait

If Status 401/403 (Auth Failed):
→ Try next provider immediately

If Status 500+ (Server Error):
→ Retry with exponential backoff
→ Max 3 retry attempts
```

---

## 7. DATABASE SCHEMA (Simplified)

```sql
-- Articles table
CREATE TABLE "NfArticle" (
  id VARCHAR PRIMARY KEY,
  title VARCHAR,
  content TEXT,
  category VARCHAR,
  pipelineStatus ENUM('DRAFT_READY', 'PUBLISHED', ...),
  editorialGrade VARCHAR,
  overallScore FLOAT,
  createdAt TIMESTAMP
);

-- Pipeline jobs table (tracking)
CREATE TABLE "NfPipelineJob" (
  id VARCHAR PRIMARY KEY,
  watchlistId VARCHAR,
  status ENUM('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED'),
  currentStage VARCHAR,
  agentReports JSON,
  stageStatuses JSON,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP
);

-- Watchlist (RSS articles)
CREATE TABLE "NfWatchlist" (
  id VARCHAR PRIMARY KEY,
  headline VARCHAR,
  sourceUrl VARCHAR,
  sourceName VARCHAR,
  contentSnippet TEXT,
  category VARCHAR,
  createdAt TIMESTAMP
);

-- Pipeline slots (concurrency control)
CREATE TABLE "NfPipelineSlot" (
  slotNumber INT PRIMARY KEY,
  status ENUM('IDLE', 'BUSY'),
  currentJobId VARCHAR,
  startedAt TIMESTAMP
);
```

