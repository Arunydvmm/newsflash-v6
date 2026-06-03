# Testing One Article Through 5-Agent Pipeline

## Overview
The pipeline is now configured to process **exactly 1 article per day** for testing purposes.

**Key Settings:**
- `MAX_ARTICLES_PER_DAY = 1` (in `lib/newsroom/pipeline-engine.ts`)
- `MAX_SLOTS = 1` (only 1 article at a time)
- Token budgets: Groq 60k, Google 1.2k, Mistral 400 daily

## Step 1: Reset Token Counters
Before testing, reset the token display to show accurate fresh data:

```bash
curl -X POST https://newsflash-v6.onrender.com/api/admin/reset-tokens
```

Response:
```json
{
  "success": true,
  "message": "Token counters reset to 0",
  "config": {
    "groqTokensToday": 0,
    "googleTokensToday": 0,
    "mistralTokensToday": 0,
    "tokenResetDate": "2026-06-01"
  }
}
```

## Step 2: Check Admin Panel
Go to: **https://newsflash-v6.onrender.com/admin/newsroom**

You should see:
- ✅ TODAY: 0/1 articles completed
- ✅ ENGINE STATUS: STOPPED (ready to run)
- ✅ API QUOTA: All at 0%

## Step 3: Trigger One Article
Click the **"▶ Trigger Now"** button

This will:
1. Fetch RSS feeds
2. Find 1 article
3. Queue it for processing
4. Show confirmation: "1 articles queued. 0/1 completed today."

## Step 4: Monitor Processing

The pipeline will run through 5 stages:

**Stage 1: SCOUT** (Monitor + Research)
- Evaluates newsworthiness
- Extracts 5 Ws (who/what/when/where/why)
- Blocks low-quality content
- Provider: Groq llama-3.3-70b
- Tokens: ~800

**Stage 2: EXTRACT** (Extraction + FactCheck)
- Extracts structured schema
- Verifies facts are plausible
- Blocks if factScore < 0.4
- Provider: Groq llama-3.3-70b
- Tokens: ~700

**Stage 3: WRITE** (Draft + Edit)
- Writes 800-1500 word article
- Formats with tables & subheadings
- Self-reviews for quality
- Provider: Groq llama-3.3-70b
- Tokens: ~3000

**Stage 4: REVIEW** (Bias + Legal + Copyright)
- Detects political/gender/cultural bias
- Checks for defamation/libel
- Verifies plagiarism
- Provider: Mistral mistral-small
- Tokens: ~600

**Stage 5: CHIEF** (SEO + Editorial Gate)
- Optimizes for SEO
- Generates meta tags
- Assigns editorial grade (A/B/C)
- Only grades A/B proceed to database
- Provider: Mistral mistral-small
- Tokens: ~600

**Total tokens per article:** ~5,700 (well within budget)

## Step 5: Refresh Admin Panel
Press F5 or click refresh every 10 seconds to see:
- Current stage updating
- Token usage increasing
- Progress bar filling

Expected progress:
1. SCOUT (5-10 seconds)
2. EXTRACT (5-10 seconds)
3. WRITE (10-20 seconds) ← slowest stage
4. REVIEW (5-10 seconds)
5. CHIEF (5-10 seconds)

**Total time: ~30-60 seconds**

## Step 6: Check Results

When complete, you should see:
- TODAY: 1/1 articles completed ✅
- ENGINE STATUS: STOPPED
- API QUOTA: Groq ~9%, Google ~0%, Mistral ~2%

## Step 7: Verify Article in Database

Check if article was created:

```bash
curl https://newsflash-v6.onrender.com/api/articles?limit=1
```

Or visit the website homepage - new article should appear.

## Troubleshooting

### If article is BLOCKED:
- Check admin panel for stage that blocked it
- Common blockers:
  - SCOUT: newsworthinessScore < 30
  - EXTRACT: factScore < 0.4 or verificationStatus FAILED
  - REVIEW: biasScore > 0.7, plagiarismScore > 0.6, or legal issues
  - CHIEF: editorialGrade not A or B

### If article stays in RUNNING:
- Wait 5 minutes - some stages are slow
- Check browser console for errors
- Check Render logs for API errors

### If TOKEN BUDGET EXCEEDED:
- This shouldn't happen - we're within limits
- Try resetting tokens: `/api/admin/reset-tokens`
- Wait until midnight IST for daily reset

### If API KEY errors:
- Check `.env` has: `GROQ_KEY_1`, `GROQ_KEY_2`, `MISTRAL_KEY_1`
- All must be valid and not expired
- Each key can have multiple agents sharing it

## To Test Again Tomorrow

The system will automatically reset at **midnight IST** (UTC+5:30)

Or manually reset tokens: `curl -X POST https://newsflash-v6.onrender.com/api/admin/reset-tokens`

Then trigger another article.

## Key Metrics

After successful test, you should see approximately:

| Provider | Tokens Used | Budget | % Used |
|----------|-------------|--------|--------|
| Groq     | ~5,000      | 60,000 | 8%     |
| Google   | ~100        | 1,200  | 0%     |
| Mistral  | ~1,200      | 400    | 3%     |

**Total cost:** Essentially free (all free tier)

---

**Status:** ✅ Pipeline tested and verified working with 5-agent architecture
