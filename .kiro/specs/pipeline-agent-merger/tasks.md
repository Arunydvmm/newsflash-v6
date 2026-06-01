# Pipeline Agent Merger: 7 Agents → 5 Agents

**Status**: In Progress  
**Created**: 2024  
**Objective**: Rebuild the NewsFlash AI newsroom pipeline from 7 agents down to 5 by merging roles, integrate all 10 API keys (9 existing + 1 Nvidia), achieve zero pipeline errors, and maintain 5 articles per day throughput.

---

## Task 1: Delete Old Agent Files
**Status**: COMPLETED  
**Dependencies**: None  
**Type**: Cleanup

Delete all 7 old agent files that are being replaced by the new 5-agent architecture:
- `lib/newsroom/agents/agent1-monitor.ts` → merged into SCOUT
- `lib/newsroom/agents/agent2-research.ts` → merged into SCOUT
- `lib/newsroom/agents/agent3-extract-verify.ts` → replaced by EXTRACT
- `lib/newsroom/agents/agent4-write.ts` → replaced by WRITE
- `lib/newsroom/agents/agent5-safety.ts` → merged into REVIEW
- `lib/newsroom/agents/agent6-seo-polish.ts` → merged into REVIEW
- `lib/newsroom/agents/agent7-chiefeditor.ts` → replaced by CHIEF

**Verification**: All old files deleted, only 5 new agent files remain.

---

## Task 2: Verify New 5-Agent Files
**Status**: COMPLETED  
**Dependencies**: Task 1  
**Type**: Verification

Verify that all 5 new agent files exist and are properly configured:
- `lib/newsroom/agents/agent1-scout.ts` (Monitor + Research merged)
- `lib/newsroom/agents/agent2-extract.ts` (Extract + Verify)
- `lib/newsroom/agents/agent3-write.ts` (Article Writer)
- `lib/newsroom/agents/agent4-review.ts` (Safety + SEO + Polish merged)
- `lib/newsroom/agents/agent5-chief.ts` (Chief Editor)

**Verification**: All 5 files exist, compile without errors, and have correct function signatures.

---

## Task 3: Verify Agent Key Configuration
**Status**: COMPLETED  
**Dependencies**: None  
**Type**: Configuration

Verify `lib/newsroom/agent-keys.config.ts` has all 10 keys properly assigned:

**Primary Assignments**:
- SCOUT: GROQ_KEY_1 (Groq llama-3.3-70b)
- EXTRACT: GROQ_KEY_2 (Groq llama-3.3-70b)
- WRITE: OPENROUTER_KEY_1 (OpenRouter mistral-7b)
- REVIEW: OPENROUTER_KEY_3 (OpenRouter mistral-7b)
- CHIEF: NVIDIA_API_KEY (Nvidia nemotron-3-nano-omni-30b-a3b-reasoning)

**Backup Assignments**:
- SCOUT: GROQ_KEY_2
- EXTRACT: GOOGLE_AI_KEY_1 (Google Gemini-1.5-flash)
- WRITE: OPENROUTER_KEY_2 (OpenRouter gemma-2-9b)
- REVIEW: MISTRAL_KEY_1 (Mistral small-latest)
- CHIEF: OPENROUTER_KEY_4 (OpenRouter mistral-7b)

**Fallback Keys**:
- GEMINI_KEY_1 (Google Gemini-2.0-flash)
- GEMINI_KEY_2 (Google Gemini-2.0-flash)

**Verification**: All 10 keys configured, no duplicates, KEY_SHARING_MAP complete.

---

## Task 4: Verify Nvidia Provider Integration
**Status**: COMPLETED  
**Dependencies**: None  
**Type**: Integration

Verify `lib/newsroom/agent-caller.ts` has Nvidia provider properly integrated:
- Nvidia endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`
- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Timeout: 90 seconds (reasoning models are slower)
- Thinking tags stripped from response
- JSON parsing safe (no crashes on malformed JSON)

**Verification**: Nvidia provider code exists, handles errors gracefully, returns proper JSON.

---

## Task 5: Verify Pipeline Engine Configuration
**Status**: COMPLETED  
**Dependencies**: Task 2, Task 3, Task 4  
**Type**: Configuration

Verify `lib/newsroom/pipeline-engine.ts` has correct STAGES array:

```
SCOUT   (800 tokens, 5s delay)  → Groq KEY_1
EXTRACT (700 tokens, 6s delay)  → Groq KEY_2
WRITE   (3000 tokens, 8s delay) → OpenRouter
REVIEW  (1000 tokens, 5s delay) → OpenRouter
CHIEF   (800 tokens, 0s delay)  → Nvidia
```

**Token Budget Verification**:
- Groq KEY_1: 800 × 5 = 4,000 / 100,000 = 4% ✅
- Groq KEY_2: 700 × 5 = 3,500 / 100,000 = 3.5% ✅
- OpenRouter: 4,000 × 5 = 20,000 (free tier) ✅
- Nvidia: 800 × 5 = 4,000 (free tier) ✅
- **Total daily**: 7,500 Groq tokens with 92,500 buffer remaining

**Verification**: STAGES array correct, token math verified, delays in place.

---

## Task 6: Verify .env.example Has All Keys
**Status**: COMPLETED  
**Dependencies**: None  
**Type**: Configuration

Verify `.env.example` includes all 10 API keys:
- GROQ_KEY_1, GROQ_KEY_2
- OPENROUTER_KEY_1, OPENROUTER_KEY_2, OPENROUTER_KEY_3, OPENROUTER_KEY_4
- GOOGLE_AI_KEY_1, GEMINI_KEY_1, GEMINI_KEY_2
- MISTRAL_KEY_1
- NVIDIA_API_KEY

**Verification**: All 10 keys present in .env.example with comments.

---

## Task 7: Verify Error Safeguards
**Status**: COMPLETED  
**Dependencies**: Task 4  
**Type**: Safety

Verify `lib/newsroom/agent-caller.ts` has all error safeguards:

1. **JSON Parse Safety**: `safeParseJSON()` function never crashes on malformed JSON
2. **Timeout Safety**: Every API call has AbortSignal timeout
   - Groq: 30s
   - OpenRouter: 60s
   - Google: 30s
   - Mistral: 30s
   - Nvidia: 90s
3. **Pipeline Resilience**: Non-critical stages fail safely, critical stages (WRITE, CHIEF) fail the job
4. **Rate Limit Handling**: Parses retry-after, sleeps intelligently, retries
5. **Token Budget Checking**: Checks budget before calling provider

**Verification**: All safeguards in place, no crashes on bad JSON, timeouts enforced.

---

## Task 8: Verify Admin Panel Status Display
**Status**: PENDING  
**Dependencies**: Task 2, Task 3  
**Type**: UI

Verify `app/admin/newsroom/page.tsx` displays correct pipeline status:

**Should Show**:
- Today's progress: X/5 articles completed
- Engine status: RUNNING or STOPPED
- Current job headline and stage
- Queue status: queued, running, completed, failed, held
- API quota bars for Groq, Google, Mistral
- Sleeping agents (if any)
- Control buttons: Trigger Now, Stop Engine, Resume, Wipe Data

**Agent Tiles** (if implemented):
- SCOUT: "Monitor + Research" — Groq KEY_1 llama-70b
- EXTRACT: "Extract + Verify" — Groq KEY_2 llama-70b
- WRITE: "Article Writer" — OpenRouter mistral-7b
- REVIEW: "Safety + SEO" — OpenRouter mistral-7b
- CHIEF: "Chief Editor" — Nvidia nemotron-reasoning

**Verification**: Admin panel displays all required information, no errors on load.

---

## Task 9: Run Prisma Migration
**Status**: PENDING  
**Dependencies**: None  
**Type**: Database

Run Prisma migration to ensure schema is up-to-date:

```bash
npx prisma migrate dev --name five-agent-pipeline
npx prisma generate
```

**Verification**: Migration succeeds, Prisma client regenerated.

---

## Task 10: Test Pipeline with Single Article
**Status**: PENDING  
**Dependencies**: Task 1-9  
**Type**: Integration Test

Test the complete 5-agent pipeline with a single test article:

1. Add a test watchlist entry
2. Trigger the pipeline manually
3. Verify all 5 stages complete successfully
4. Check that article is saved with correct metadata
5. Verify no errors in logs

**Expected Output**:
- All 5 agents execute in order
- No JSON parse errors
- No timeout errors
- Article saved to database
- Pipeline completes in under 5 minutes

**Verification**: Single article processes successfully through all 5 stages.

---

## Task 11: Test 5 Articles Per Day Throughput
**Status**: PENDING  
**Dependencies**: Task 10  
**Type**: Load Test

Test that pipeline can process 5 articles per day without hitting API quotas:

1. Queue 5 test articles
2. Run pipeline to completion
3. Verify all 5 complete successfully
4. Check token usage: Groq should be under 10% of daily quota
5. Verify no rate limiting or quota errors

**Expected Output**:
- 5 articles processed in sequence
- Groq tokens: ~7,500 used (7.5% of 100,000)
- No API errors
- All articles saved

**Verification**: 5 articles process successfully, token budget verified.

---

## Task 12: Verify Zero Pipeline Errors
**Status**: PENDING  
**Dependencies**: Task 11  
**Type**: Validation

Verify that the pipeline has zero errors:

1. Check logs for any ERROR level messages
2. Verify no JSON parse failures
3. Verify no timeout errors
4. Verify no API key errors
5. Verify no database errors
6. Verify all recommendations are valid (PROCEED, BLOCK, REWRITE, ESCALATE)

**Verification**: Zero errors in pipeline logs, all articles processed cleanly.

---

## Task 13: Document Key Assignments
**Status**: PENDING  
**Dependencies**: Task 3  
**Type**: Documentation

Create documentation of the 10-key assignment:

```
KEY              PROVIDER      AGENT           ROLE
─────────────────────────────────────────────────────
GROQ_KEY_1       Groq          Agent 1 SCOUT   Primary
GROQ_KEY_2       Groq          Agent 2 EXTRACT Primary
OPENROUTER_KEY_1 OpenRouter    Agent 3 WRITE   Primary
OPENROUTER_KEY_2 OpenRouter    Agent 3 WRITE   Backup
OPENROUTER_KEY_3 OpenRouter    Agent 4 REVIEW  Primary
OPENROUTER_KEY_4 OpenRouter    Agent 5 CHIEF   Backup
GOOGLE_AI_KEY_1  Google AI     Agent 2 EXTRACT Backup
MISTRAL_KEY_1    Mistral       Agent 4 REVIEW  Backup
NVIDIA_API_KEY   Nvidia        Agent 5 CHIEF   Primary
GEMINI_KEY_1     Gemini Legacy Universal Fallback
GEMINI_KEY_2     Gemini Legacy Universal Fallback
```

**Verification**: Documentation complete and accurate.

---

## Summary

**Total Tasks**: 13  
**Completed**: 7  
**Pending**: 6  

**Completed**:
1. ✅ Delete Old Agent Files
2. ✅ Verify New 5-Agent Files
3. ✅ Verify Agent Key Configuration
4. ✅ Verify Nvidia Provider Integration
5. ✅ Verify Pipeline Engine Configuration
6. ✅ Verify .env.example Has All Keys
7. ✅ Verify Error Safeguards

**Pending**:
8. ⏳ Verify Admin Panel Status Display
9. ⏳ Run Prisma Migration
10. ⏳ Test Pipeline with Single Article
11. ⏳ Test 5 Articles Per Day Throughput
12. ⏳ Verify Zero Pipeline Errors
13. ⏳ Document Key Assignments

**Next Steps**: Complete remaining verification and testing tasks.
