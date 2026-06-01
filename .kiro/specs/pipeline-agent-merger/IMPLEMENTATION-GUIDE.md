# Pipeline Agent Merger: Implementation Guide

## Overview

This document describes the complete rebuild of the NewsFlash AI newsroom pipeline from 7 agents down to 5 agents, integrating all 10 API keys (9 existing + 1 Nvidia), achieving zero pipeline errors, and maintaining 5 articles per day throughput.

## Architecture

### Old 7-Agent Pipeline
```
MONITOR → RESEARCH → EXTRACT_VERIFY → WRITE → SAFETY → SEO_POLISH → CHIEF_EDITOR
```

### New 5-Agent Pipeline
```
SCOUT → EXTRACT → WRITE → REVIEW → CHIEF
```

## Agent Roles

### Agent 1: SCOUT (Monitor + Research Merged)
**File**: `lib/newsroom/agents/agent1-scout.ts`  
**Primary Key**: GROQ_KEY_1 (Groq llama-3.3-70b)  
**Backup Key**: GROQ_KEY_2  
**Max Tokens**: 800  
**Delay After**: 5000ms

**Responsibilities**:
- Monitor: Score newsworthiness (1-10), detect fake news signals, identify category, assign priority
- Research: Extract 5 Ws, list verifiable claims, identify source credibility, note information gaps
- Block if: score < 4 OR fake news detected

**Output Schema**:
```json
{
  "monitor": {
    "newsworthinessScore": 0-10,
    "isFakeNewsRisk": false,
    "fakeNewsSignals": [],
    "category": "POLITICS|BUSINESS|TECH|SPORTS|CRIME|HEALTH|INTERNATIONAL|OTHER",
    "priority": "URGENT|HIGH|STANDARD|LOW",
    "recommendation": "PROCEED|BLOCK",
    "blockReason": ""
  },
  "research": {
    "fiveWs": { "who": [], "what": "", "when": [], "where": [], "why": "" },
    "verifiableClaims": [{"claim": "", "confidence": 0.0}],
    "sourceCredibility": "HIGH|MEDIUM|LOW",
    "informationGaps": [],
    "researchScore": 0.0
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|BLOCK",
  "blockReason": ""
}
```

### Agent 2: EXTRACT (Extract + Verify)
**File**: `lib/newsroom/agents/agent2-extract.ts`  
**Primary Key**: GROQ_KEY_2 (Groq llama-3.3-70b)  
**Backup Key**: GOOGLE_AI_KEY_1 (Google Gemini-1.5-flash)  
**Max Tokens**: 700  
**Delay After**: 6000ms

**Responsibilities**:
- Extract structured schema from research brief
- Verify facts and extract key information
- Block if: factScore < 0.55 OR overallVerification is FAILED

**Output Schema**:
```json
{
  "schema": {
    "headline": "max 70 chars, active voice",
    "subheadline": "max 120 chars",
    "category": "",
    "organization": "",
    "keyPeople": [{"name": "", "role": ""}],
    "importantDates": [{"date": "", "significance": ""}],
    "locations": [],
    "statistics": [{"value": "", "context": ""}],
    "officialSources": [],
    "summary": "2 sentences max, facts only"
  },
  "verification": {
    "factScore": 0.0-1.0,
    "flaggedFields": [{"field": "", "reason": ""}],
    "overallVerification": "VERIFIED|PARTIAL|FAILED"
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|BLOCK",
  "blockReason": ""
}
```

### Agent 3: WRITE (Article Writer)
**File**: `lib/newsroom/agents/agent3-write.ts`  
**Primary Key**: OPENROUTER_KEY_1 (OpenRouter mistral-7b)  
**Backup Key**: OPENROUTER_KEY_2 (OpenRouter gemma-2-9b)  
**Max Tokens**: 3000  
**Delay After**: 8000ms

**Responsibilities**:
- Write complete 2500-3500 word publication-ready article
- Use inverted pyramid structure
- Include minimum 2 tables (Key Facts required)
- Mobile-first formatting (max 3 sentences per paragraph)
- Rewrite if: wordCount outside 2500-3500 OR tablesIncluded < 2

**Output Schema**:
```json
{
  "article": {
    "headline": "",
    "subheadline": "",
    "body": "full markdown 2500-3500 words",
    "metaTitle": "under 60 chars",
    "metaDescription": "under 160 chars",
    "tags": [],
    "slug": "url-slug"
  },
  "wordCount": 0,
  "tablesIncluded": 0,
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|REWRITE|BLOCK"
}
```

### Agent 4: REVIEW (Safety + SEO + Polish Merged)
**File**: `lib/newsroom/agents/agent4-review.ts`  
**Primary Key**: OPENROUTER_KEY_3 (OpenRouter mistral-7b)  
**Backup Key**: MISTRAL_KEY_1 (Mistral small-latest)  
**Max Tokens**: 1000  
**Delay After**: 5000ms

**Responsibilities**:
- Safety: Check bias (0.0-1.0), legal risk, copyright similarity
- SEO: Verify meta tags, slug, keywords, generate image queries
- Polish: Grammar/spelling, India number format (lakh/crore), mobile-friendly tables
- Block if: bias > 0.7 OR legal risk HIGH OR copyright > 0.15 OR safety.overallSafe is false

**Output Schema**:
```json
{
  "safety": {
    "biasScore": 0.0,
    "legalRisk": "CLEAR|CAUTION|BLOCKED",
    "copyrightScore": 0.0,
    "overallSafe": true
  },
  "seo": {
    "metaTitle": "",
    "metaDescription": "",
    "slug": "",
    "primaryKeyword": "",
    "keywords": [],
    "seoScore": 0.0,
    "imageQueries": {
      "cover": "",
      "inline1": "",
      "inline2": ""
    }
  },
  "polish": {
    "corrections": [],
    "mobileReady": true
  },
  "confidence": 0.0-1.0,
  "recommendation": "PROCEED|BLOCK",
  "blockReason": ""
}
```

### Agent 5: CHIEF (Chief Editor - Final Gate)
**File**: `lib/newsroom/agents/agent5-chief.ts`  
**Primary Key**: NVIDIA_API_KEY (Nvidia nemotron-3-nano-omni-30b-a3b-reasoning)  
**Backup Key**: OPENROUTER_KEY_4 (OpenRouter mistral-7b)  
**Max Tokens**: 800  
**Delay After**: 0ms (final stage)

**Responsibilities**:
- Review complete pipeline report
- Grade article: A (all scores > 0.8), B (all scores > 0.65), C (any score 0.5-0.65), REWRITE, REJECT
- Make final publish decision
- Reject if: any block flag OR safety failed OR wordCount outside 2500-3500 OR extract score < 0.6

**Output Schema**:
```json
{
  "editorialGrade": "A|B|C|REWRITE|REJECT",
  "overallScore": 0.0-1.0,
  "decision": "PUBLISH_NOW|HOLD_FOR_REVIEW|REWRITE|REJECT",
  "decisionReason": "",
  "finalCategory": "",
  "finalTags": [],
  "scheduleSuggestion": "immediate|morning|evening",
  "editorNotes": ""
}
```

## API Key Assignment

### All 10 Keys

| Key | Provider | Agent | Role | Model |
|-----|----------|-------|------|-------|
| GROQ_KEY_1 | Groq | SCOUT | Primary | llama-3.3-70b-versatile |
| GROQ_KEY_2 | Groq | EXTRACT | Primary | llama-3.3-70b-versatile |
| OPENROUTER_KEY_1 | OpenRouter | WRITE | Primary | mistralai/mistral-7b-instruct:free |
| OPENROUTER_KEY_2 | OpenRouter | WRITE | Backup | google/gemma-2-9b-it:free |
| OPENROUTER_KEY_3 | OpenRouter | REVIEW | Primary | mistralai/mistral-7b-instruct:free |
| OPENROUTER_KEY_4 | OpenRouter | CHIEF | Backup | mistralai/mistral-7b-instruct:free |
| GOOGLE_AI_KEY_1 | Google AI | EXTRACT | Backup | gemini-1.5-flash |
| MISTRAL_KEY_1 | Mistral | REVIEW | Backup | mistral-small-latest |
| NVIDIA_API_KEY | Nvidia | CHIEF | Primary | nvidia/nemotron-3-nano-omni-30b-a3b-reasoning |
| GEMINI_KEY_1 | Gemini Legacy | Fallback | Universal | gemini-2.0-flash |
| GEMINI_KEY_2 | Gemini Legacy | Fallback | Universal | gemini-2.0-flash |

### Token Budget (Per Article)

```
SCOUT:   800 tokens  → Groq KEY_1
EXTRACT: 700 tokens  → Groq KEY_2
WRITE:   3000 tokens → OpenRouter (free tier)
REVIEW:  1000 tokens → OpenRouter (free tier)
CHIEF:   800 tokens  → Nvidia (free tier)
─────────────────────────────────
Total:   6300 tokens per article

Daily (5 articles):
Groq KEY_1: 800 × 5 = 4,000 / 100,000 = 4% ✅
Groq KEY_2: 700 × 5 = 3,500 / 100,000 = 3.5% ✅
OpenRouter: 4,000 × 5 = 20,000 (free) ✅
Nvidia:     800 × 5 = 4,000 (free) ✅

Total daily: 7,500 Groq tokens
Buffer remaining: 92,500 tokens (92.5%)
```

## Error Safeguards

### 1. JSON Parse Safety
- `safeParseJSON()` function never crashes on malformed JSON
- Strips thinking tags from Nvidia responses
- Extracts JSON objects from responses
- Returns safe default if parsing fails

### 2. Timeout Safety
- Groq: 30 seconds
- OpenRouter: 60 seconds
- Google: 30 seconds
- Mistral: 30 seconds
- Nvidia: 90 seconds (reasoning models are slower)

### 3. Pipeline Resilience
- Non-critical stages fail safely (continue with safe defaults)
- Critical stages (WRITE, CHIEF) fail the job
- All errors logged but don't crash pipeline

### 4. Rate Limit Handling
- Parses retry-after from error messages
- Sleeps intelligently (max 5 minutes)
- Retries after sleep
- Skips to next key if wait too long

### 5. Token Budget Checking
- Checks budget before calling provider
- Skips provider if budget exceeded
- Tries next provider in fallback chain

## File Structure

```
lib/newsroom/
├── agents/
│   ├── agent1-scout.ts          (Monitor + Research)
│   ├── agent2-extract.ts        (Extract + Verify)
│   ├── agent3-write.ts          (Article Writer)
│   ├── agent4-review.ts         (Safety + SEO + Polish)
│   └── agent5-chief.ts          (Chief Editor)
├── agent-caller.ts              (Provider caller with error handling)
├── agent-keys.config.ts         (10-key configuration)
├── pipeline-engine.ts           (5-stage pipeline orchestrator)
├── pipeline.service.ts          (Pipeline service)
├── token-budget.ts              (Token tracking)
├── rss.service.ts               (RSS feed fetching)
├── duplicate.service.ts         (Duplicate detection)
├── report.generator.ts          (Report generation)
└── disable-emergency.ts         (Emergency controls)
```

## Configuration Files

### .env.example
```env
# Groq (2 keys)
GROQ_KEY_1=
GROQ_KEY_2=

# OpenRouter (4 keys)
OPENROUTER_KEY_1=
OPENROUTER_KEY_2=
OPENROUTER_KEY_3=
OPENROUTER_KEY_4=

# Google AI
GOOGLE_AI_KEY_1=
GEMINI_KEY_1=
GEMINI_KEY_2=

# Mistral
MISTRAL_KEY_1=

# Nvidia (NEW)
NVIDIA_API_KEY=
```

### agent-keys.config.ts
```typescript
export const AGENT_KEYS = {
  SCOUT: {
    primary: { key: process.env.GROQ_KEY_1!, provider: 'groq', model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.GROQ_KEY_2!, provider: 'groq', model: 'llama-3.3-70b-versatile' }
  },
  EXTRACT: {
    primary: { key: process.env.GROQ_KEY_2!, provider: 'groq', model: 'llama-3.3-70b-versatile' },
    backup:  { key: process.env.GOOGLE_AI_KEY_1!, provider: 'google', model: 'gemini-1.5-flash' }
  },
  WRITE: {
    primary: { key: process.env.OPENROUTER_KEY_1!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
    backup:  { key: process.env.OPENROUTER_KEY_2!, provider: 'openrouter', model: 'google/gemma-2-9b-it:free' }
  },
  REVIEW: {
    primary: { key: process.env.OPENROUTER_KEY_3!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' },
    backup:  { key: process.env.MISTRAL_KEY_1!, provider: 'mistral', model: 'mistral-small-latest' }
  },
  CHIEF: {
    primary: { key: process.env.NVIDIA_API_KEY!, provider: 'nvidia', model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning' },
    backup:  { key: process.env.OPENROUTER_KEY_4!, provider: 'openrouter', model: 'mistralai/mistral-7b-instruct:free' }
  }
}

export const FALLBACK_KEYS = [
  { key: process.env.GEMINI_KEY_1!, provider: 'google_legacy', model: 'gemini-2.0-flash' },
  { key: process.env.GEMINI_KEY_2!, provider: 'google_legacy', model: 'gemini-2.0-flash' }
]
```

## Pipeline Flow

### Stage 1: SCOUT (5s delay)
```
Input: headline, snippet, source, published date
↓
Monitor: newsworthiness score, fake news detection, category, priority
Research: 5 Ws, verifiable claims, source credibility
↓
Output: monitor report + research brief
Recommendation: PROCEED or BLOCK
```

### Stage 2: EXTRACT (6s delay)
```
Input: research brief from SCOUT
↓
Extract: structured schema (headline, subheadline, people, dates, locations, stats)
Verify: fact score, flagged fields, overall verification
↓
Output: schema + verification report
Recommendation: PROCEED or BLOCK
```

### Stage 3: WRITE (8s delay)
```
Input: schema from EXTRACT
↓
Write: 2500-3500 word article
Structure: inverted pyramid, short paragraphs, subheadings
Tables: minimum 2 (Key Facts required)
↓
Output: full article + metadata
Recommendation: PROCEED, REWRITE, or BLOCK
```

### Stage 4: REVIEW (5s delay)
```
Input: article from WRITE
↓
Safety: bias score, legal risk, copyright check
SEO: meta tags, slug, keywords, image queries
Polish: grammar, India number format, mobile-friendly
↓
Output: safety + SEO + polish report
Recommendation: PROCEED or BLOCK
```

### Stage 5: CHIEF (0s delay)
```
Input: all previous reports + scores
↓
Grade: A (all > 0.8), B (all > 0.65), C (any 0.5-0.65), REWRITE, REJECT
Decision: PUBLISH_NOW, HOLD_FOR_REVIEW, REWRITE, or REJECT
↓
Output: editorial grade + decision
Save article if Grade A or B
```

## Testing Checklist

- [ ] All 5 agent files exist and compile
- [ ] All 10 API keys configured in agent-keys.config.ts
- [ ] Nvidia provider integrated in agent-caller.ts
- [ ] Pipeline engine has correct STAGES array
- [ ] .env.example has all 10 keys
- [ ] Error safeguards in place (JSON parsing, timeouts, rate limits)
- [ ] Admin panel displays pipeline status
- [ ] Single article processes through all 5 stages
- [ ] 5 articles process without hitting API quotas
- [ ] Zero errors in pipeline logs
- [ ] Token budget verified (Groq < 10% daily)

## Deployment

1. Update `.env` with all 10 API keys
2. Run `npx prisma migrate dev --name five-agent-pipeline`
3. Run `npx prisma generate`
4. Test with single article
5. Monitor logs for errors
6. Enable scheduler to process 5 articles per day

## Monitoring

### Admin Panel
- Today's progress: X/5 articles completed
- Engine status: RUNNING or STOPPED
- Current job headline and stage
- Queue status
- API quota bars
- Sleeping agents (if rate limited)

### Logs
- Check for ERROR level messages
- Verify no JSON parse failures
- Verify no timeout errors
- Verify no API key errors
- Verify all recommendations valid

### Token Budget
- Groq: should be under 10% daily
- OpenRouter: free tier (no quota)
- Nvidia: free tier (no quota)
- Google: should be under 10% daily
- Mistral: should be under 10% daily
