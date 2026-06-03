# 🎯 AI NEWSROOM - COMPLETE WORKFLOW SUMMARY

## File: AI_NEWSROOM_WORKFLOW.md

Your complete workflow documentation is ready! Here's what you have:

---

## 📋 WHAT'S DOCUMENTED

### 1. **Complete Workflow Diagram**
A visual step-by-step flow showing:
- RSS Fetching (10 sources)
- Scheduler (article selection)
- Queue (job management)
- 5-Stage Pipeline

### 2. **Stage-by-Stage Breakdown**

#### **STAGE 1: SCOUT Agent**
```
INPUT:    Headline + snippet + source
MODELS:   Groq (Primary) / Google Gemini (Backup)
API KEY:  GROQ_API_KEY_1
TOKENS:   800/day
TASK:     Score newsworthiness (1-10)
OUTPUT:   Newsworthiness score, category, priority
```

#### **STAGE 2: EXTRACT Agent**
```
INPUT:    Scout report + article data
MODELS:   Groq (Primary) / Google Gemini (Backup)
API KEY:  GROQ_API_KEY_2
TOKENS:   700/day
TASK:     Build verified schema, fact-check
OUTPUT:   Structured data, fact scores
```

#### **STAGE 3: WRITE Agent**
```
INPUT:    Verified schema
MODELS:   OpenRouter (Primary) / Groq (Backup)
API KEY:  OPENROUTER_API_KEY
TOKENS:   3000/day (unlimited free tier)
TASK:     Generate 500-2000 word article
OUTPUT:   Full article with metadata
```

#### **STAGE 4: REVIEW Agent**
```
INPUT:    Generated article
MODELS:   Google Gemini (Primary) / OpenRouter (Backup)
API KEY:  GOOGLE_GEMINI_API_KEY
TOKENS:   1000/day (⚠️ QUOTA EXCEEDED)
TASK:     Check bias, legal, copyright
OUTPUT:   Safety verdict, SEO improvements
```

#### **STAGE 5: CHIEF Agent**
```
INPUT:    All stage reports + scores
MODELS:   Nvidia (Primary) / Mistral (Backup) / OpenRouter (3rd)
API KEY:  NVIDIA_API_KEY / MISTRAL_API_KEY
TOKENS:   800/day (⚠️ LIMITED/EXCEEDED)
TASK:     Final editorial decision & grading
OUTPUT:   Grade (A/B/C/REWRITE/REJECT) + publish decision
```

---

## 🔑 API KEYS REQUIRED

### Primary Keys (Must Have)
```
GROQ_API_KEY_1          ✅ Active (100,000 tokens/day)
GROQ_API_KEY_2          ✅ Active (100,000 tokens/day)
OPENROUTER_API_KEY      ✅ Active (Free tier unlimited)
GOOGLE_GEMINI_API_KEY   ⚠️ Quota exceeded (free tier)
```

### Secondary Keys (Should Have)
```
NVIDIA_API_KEY          ⚠️ Not configured
MISTRAL_API_KEY         ⚠️ Budget exceeded (free tier)
```

---

## 💾 TOKEN BUDGET BREAKDOWN

### Per Article (1 article/day)
```
SCOUT (Groq):           800 tokens (0.8% of 100,000)  ✅
EXTRACT (Groq):         700 tokens (0.7% of 100,000)  ✅
WRITE (OpenRouter):     3,000 tokens (free)           ✅
REVIEW (Google):        1,000 tokens (quota exceeded) ⚠️
CHIEF (Nvidia/Mistral): 800 tokens (limited)          ⚠️
────────────────────────────────────────────────────
TOTAL:                  ~6,300 tokens per article

Daily (with 1 article/day):
  Groq:       ~1,500 tokens (1.5% of budget) ✅
  OpenRouter: ~3,000 tokens (free) ✅
  Google:     ~1,000 tokens (⚠️ exceeds free tier)
  Mistral:    ~800 tokens (⚠️ budget exceeded)
```

### If Running 5 Articles/Day (Old Config)
```
Would need: ~31,500 tokens/day
Status: ❌ NOT SUSTAINABLE with free tiers
Solution: ✅ Limited to 1 article/day
```

---

## 🔄 FALLBACK CHAIN

When a provider fails, the pipeline automatically tries next in order:

```
SCOUT/EXTRACT:
  1. Groq (primary)
  2. Google Gemini (backup)
  3. Skip & continue

WRITE:
  1. OpenRouter (primary)
  2. Groq (backup)
  3. Generate from source

REVIEW:
  1. Google Gemini
  2. OpenRouter
  3. Skip (use defaults)

CHIEF:
  1. Nvidia
  2. Mistral
  3. OpenRouter
  4. Use default Grade B
```

---

## ⚡ RATE LIMITING

### Provider Rate Limits
```
Groq:          ~100 requests/minute
Google:        60 requests/minute (free)
OpenRouter:    Depends on plan
Mistral:       Depends on plan
Nvidia:        Depends on tier
```

### How Retry Works
```
If rate limited (429):
  1. Check Retry-After header
  2. If wait < 30 min:
     → Sleep and retry
  3. If wait > 30 min:
     → Try next provider

If auth fails (401/403):
  → Try next provider immediately

If server error (500+):
  → Retry with exponential backoff
  → Max 3 attempts
```

---

## 📊 ERROR HANDLING

### Critical Stages (Stop Pipeline)
- WRITE (if article generation fails completely)

### Non-Critical Stages (Continue Anyway)
- SCOUT (uses defaults if score unavailable)
- EXTRACT (uses partial schema if needed)
- REVIEW (skipped if quota exceeded)
- CHIEF (uses default Grade B if APIs fail)

### Result: Articles Still Save ✅
Even with API failures, articles are saved to drafts for manual review.

---

## 🗄️ DATABASE RECORDS

Each article goes through:

```
1. NfWatchlist Entry
   - Original headline, snippet, source
   - Status: PENDING → PROCESSED

2. NfPipelineJob Entry
   - Tracks processing status
   - Stores all agent reports
   - Records time at each stage

3. NfArticle Entry (ONLY if Draft-Ready)
   - Generated content
   - Metadata (title, slug, tags)
   - Editorial grade
   - Status: DRAFT_READY (waiting for editor)

4. NfPipelineSlot
   - Manages concurrency (MAX 1)
   - Prevents parallel processing
```

---

## 🎯 PROCESSING FLOW

```
Day 1, 00:00 (Midnight IST):
  ├─ Scheduler runs
  ├─ Fetches top article from 10 RSS sources
  ├─ Queues 1 article
  └─ Starts pipeline

Day 1, 00:00-00:00:45:
  ├─ SCOUT evaluates (940ms)
  ├─ EXTRACT builds schema (1200ms)
  ├─ WRITE generates article (2800ms)
  ├─ REVIEW checks safety (3000ms, may skip)
  ├─ CHIEF makes decision (2500ms, may skip)
  └─ Article saved (200ms)

Day 1, 00:00:45+:
  ├─ Article in Admin Panel → AI Drafts
  ├─ Editor reviews and approves
  └─ Article published when ready

Day 2, 00:00:
  ├─ Previous article's daily limit resets
  └─ Next article can be processed
```

---

## 🔍 WHAT EACH STAGE LOOKS AT

### SCOUT (Newsworthiness)
- Breaking news keywords (URGENT, LIVE, EXCLUSIVE)
- Recency (fresher = higher score)
- Source credibility
- India-specific topics (Modi, RBI, Budget, Elections)
- Content length
- **Threshold**: Score ≥ 2 ✅ PASS

### EXTRACT (Verification)
- Who: Key people mentioned
- What: Main event/topic
- When: Dates and times
- Where: Locations
- Why: Reasons and context
- **Threshold**: Fact Score ≥ 0.30 ✅ PASS

### WRITE (Article Quality)
- Headline clarity
- Structure (inverted pyramid)
- Paragraph length (mobile-friendly)
- Subheadings
- Metadata (SEO)
- **Threshold**: Always proceeds ✅

### REVIEW (Safety)
- Bias score (< 0.85 safe)
- Legal risks (no CRITICAL issues)
- Copyright similarity (< 0.25 safe)
- Grammar and formatting
- **Threshold**: safety.overallSafe == true ✅

### CHIEF (Editorial)
- Overall quality score
- Grade assignment (A/B/C)
- Publishing recommendation
- Scheduling suggestion
- **Threshold**: Grade A or B ✅ DRAFT_READY

---

## 📈 PERFORMANCE METRICS

```
Processing Time:
  ├─ SCOUT:     ~940ms
  ├─ EXTRACT:  ~1200ms
  ├─ WRITE:    ~2800ms
  ├─ REVIEW:   ~3000ms (if available)
  ├─ CHIEF:    ~2500ms (if available)
  ├─ Save:     ~200ms
  └─ TOTAL:    ~45 seconds

Resources:
  ├─ Memory:   <200MB
  ├─ Database: <50ms per query
  ├─ Concurrent: 1 (by design)
  └─ Daily Articles: 1 (max)
```

---

## ⚠️ CURRENT ISSUES & SOLUTIONS

### Issue 1: Google Gemini Quota Exceeded
**Status**: ⚠️ EXCEEDED
**Impact**: REVIEW stage skipped, articles still save
**Solution**: 
- Option 1: Wait for daily reset (midnight UTC)
- Option 2: Upgrade to paid Google Gemini plan
- Option 3: Increase quota request

### Issue 2: Mistral Budget Exceeded
**Status**: ⚠️ EXCEEDED (free tier)
**Impact**: CHIEF stage uses OpenRouter fallback
**Solution**:
- Wait for daily reset
- Or upgrade Mistral plan

### Issue 3: Nvidia API Not Configured
**Status**: ⚠️ NOT CONFIGURED
**Impact**: CHIEF stage skips Nvidia, uses fallback
**Solution**:
- Get Nvidia API key
- Add to environment variables

---

## ✅ WHAT'S WORKING

- ✅ Groq APIs (SCOUT & EXTRACT)
- ✅ OpenRouter (WRITE fallback)
- ✅ Database persistence
- ✅ Error handling
- ✅ Fallback chains
- ✅ Rate limiting
- ✅ Token tracking
- ✅ End-to-end pipeline

---

## 🎓 UNDERSTANDING THE SYSTEM

### Why 5 Agents Instead of 11?
**Original**: 11 separate agents (inefficient)
```
MONITORING → RESEARCH → EXTRACTION → FACTCHECK 
→ JUNIOR_DRAFT → SENIOR_EDIT → BIAS_CHECK 
→ LEGAL_CHECK → COPYRIGHT → SEO → CHIEFEDITOR
```

**New**: 5 merged agents (efficient)
```
SCOUT (monitoring + research)
→ EXTRACT (extraction + verification)
→ WRITE (draft + edit)
→ REVIEW (bias + legal + copyright)
→ CHIEF (seo + editorial)
```

### Why Limit to 1 Article/Day?
**Reason**: Token budget constraints with free tiers
```
5 articles/day = 31,500 tokens = EXCEEDS ALL free quotas
1 article/day = 6,300 tokens = SUSTAINABLE
```

### Why Graceful Degradation?
**Instead of failing**:
```
❌ If Review fails → Stop (bad experience)
✅ If Review fails → Skip it, continue anyway
```
**Result**: Articles still reach drafts, editors can review manually.

---

## 🚀 HOW TO DEPLOY

1. **Check Configuration** ✅
   ```
   GROQ_API_KEY_1: ✅ Set
   GROQ_API_KEY_2: ✅ Set
   OPENROUTER_API_KEY: ✅ Set
   GOOGLE_GEMINI_API_KEY: ✅ Set (quota issue OK)
   NVIDIA_API_KEY: ⚠️ Add this
   MISTRAL_API_KEY: ✅ Set (budget issue OK)
   ```

2. **Verify Database** ✅
   ```
   PostgreSQL: ✅ Connected
   Prisma: ✅ Migrated
   Tables: ✅ Created
   ```

3. **Set Environment Variables**
   ```
   MAX_ARTICLES_PER_DAY=1
   SCHEDULER_SECRET=<your-secret>
   DATABASE_URL=<postgres-url>
   NEXT_PUBLIC_SITE_URL=<your-url>
   ```

4. **Deploy** ✅
   ```
   npm run build
   npm run start
   ```

5. **Test** ✅
   ```
   POST /api/admin/trigger-scheduler
   → Should queue 1 article
   → Articles should appear in drafts
   ```

---

## 📚 FILES TO READ

1. **AI_NEWSROOM_WORKFLOW.md** ← Complete technical details
2. **TEST_SUITE.md** ← Test coverage and results
3. **TEST_REPORT_SUMMARY.txt** ← Executive summary
4. **README_TESTING.md** ← How to use documentation
5. **WEBSITE_DEMO.html** ← Interactive dashboard

---

## 🎉 YOU NOW UNDERSTAND

✅ How every stage works
✅ Which models are used where
✅ Which API keys are needed
✅ Token budget allocation
✅ Error handling & fallbacks
✅ Rate limiting & retries
✅ Database schema
✅ Performance metrics
✅ Current issues & solutions
✅ How to deploy

---

**File**: `AI_NEWSROOM_WORKFLOW.md`  
**Status**: ✅ COMPLETE  
**Build**: 9e158dde  
**Date**: June 3, 2026

