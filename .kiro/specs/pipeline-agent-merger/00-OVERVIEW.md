# Pipeline Agent Merger: Overview

## Project Summary

**Objective**: Rebuild the NewsFlash AI newsroom pipeline from 7 agents down to 5 agents by merging roles, integrate all 10 API keys (9 existing + 1 Nvidia), achieve zero pipeline errors, and maintain 5 articles per day throughput.

**Status**: In Progress (7/13 tasks completed)

**Timeline**: 
- Completed: Agent cleanup, configuration, integration
- Pending: Testing, verification, documentation

## What Changed

### Before: 7-Agent Pipeline
```
1. MONITOR          (news scoring, fake news detection)
2. RESEARCH         (5 Ws extraction, source credibility)
3. EXTRACT_VERIFY   (schema extraction, fact verification)
4. WRITE            (article writing)
5. SAFETY           (bias, legal, copyright checks)
6. SEO_POLISH       (SEO optimization, grammar, polish)
7. CHIEF_EDITOR     (final editorial decision)
```

### After: 5-Agent Pipeline
```
1. SCOUT            (MONITOR + RESEARCH merged)
2. EXTRACT          (EXTRACT_VERIFY unchanged)
3. WRITE            (WRITE unchanged)
4. REVIEW           (SAFETY + SEO_POLISH merged)
5. CHIEF            (CHIEF_EDITOR unchanged)
```

## Key Improvements

### 1. Reduced Complexity
- 7 agents → 5 agents
- Fewer API calls per article
- Simpler error handling
- Easier to monitor and debug

### 2. Better Role Consolidation
- **SCOUT**: Combines monitoring and research in one pass (800 tokens)
- **EXTRACT**: Focused schema extraction and verification (700 tokens)
- **WRITE**: Dedicated article writing (3000 tokens)
- **REVIEW**: Comprehensive safety, SEO, and polish checks (1000 tokens)
- **CHIEF**: Final editorial gate with reasoning model (800 tokens)

### 3. All 10 API Keys Actively Used
- **Groq**: 2 keys (SCOUT primary, EXTRACT primary)
- **OpenRouter**: 4 keys (WRITE primary/backup, REVIEW primary, CHIEF backup)
- **Google AI**: 1 key (EXTRACT backup)
- **Mistral**: 1 key (REVIEW backup)
- **Nvidia**: 1 key (CHIEF primary - best model for final decision)
- **Gemini Legacy**: 2 keys (universal fallback)

### 4. Zero Idle Keys
Every key has a specific role and is actively used in the pipeline.

### 5. Token Budget Optimized
- Daily Groq usage: 7,500 tokens (7.5% of 100,000 quota)
- Buffer remaining: 92,500 tokens (92.5%)
- Never hits quota at 5 articles/day

### 6. Error Safeguards
- JSON parse safety (never crashes on malformed JSON)
- Timeout safety (every API call has timeout)
- Pipeline resilience (non-critical stages fail safely)
- Rate limit handling (intelligent sleep and retry)
- Token budget checking (skips provider if budget exceeded)

## Files Changed

### Deleted (Old Agent Files)
- `lib/newsroom/agents/agent1-monitor.ts`
- `lib/newsroom/agents/agent2-research.ts`
- `lib/newsroom/agents/agent3-extract-verify.ts`
- `lib/newsroom/agents/agent4-write.ts`
- `lib/newsroom/agents/agent5-safety.ts`
- `lib/newsroom/agents/agent6-seo-polish.ts`
- `lib/newsroom/agents/agent7-chiefeditor.ts`
- Plus 11 legacy agent files (bias.agent.ts, copyright.agent.ts, etc.)

### Created (New Agent Files)
- `lib/newsroom/agents/agent1-scout.ts` ✅
- `lib/newsroom/agents/agent2-extract.ts` ✅
- `lib/newsroom/agents/agent3-write.ts` ✅
- `lib/newsroom/agents/agent4-review.ts` ✅
- `lib/newsroom/agents/agent5-chief.ts` ✅

### Updated (Configuration Files)
- `lib/newsroom/agent-keys.config.ts` ✅ (all 10 keys configured)
- `lib/newsroom/agent-caller.ts` ✅ (Nvidia provider integrated)
- `lib/newsroom/pipeline-engine.ts` ✅ (5-stage pipeline)
- `.env.example` ✅ (NVIDIA_API_KEY added)
- `app/admin/newsroom/page.tsx` ✅ (fixed duplicate code)

## API Key Assignment

### Primary Keys (Active in Pipeline)
| Agent | Key | Provider | Model |
|-------|-----|----------|-------|
| SCOUT | GROQ_KEY_1 | Groq | llama-3.3-70b-versatile |
| EXTRACT | GROQ_KEY_2 | Groq | llama-3.3-70b-versatile |
| WRITE | OPENROUTER_KEY_1 | OpenRouter | mistral-7b-instruct:free |
| REVIEW | OPENROUTER_KEY_3 | OpenRouter | mistral-7b-instruct:free |
| CHIEF | NVIDIA_API_KEY | Nvidia | nemotron-3-nano-omni-30b-a3b-reasoning |

### Backup Keys (Fallback Chain)
| Agent | Key | Provider | Model |
|-------|-----|----------|-------|
| SCOUT | GROQ_KEY_2 | Groq | llama-3.3-70b-versatile |
| EXTRACT | GOOGLE_AI_KEY_1 | Google AI | gemini-1.5-flash |
| WRITE | OPENROUTER_KEY_2 | OpenRouter | gemma-2-9b-it:free |
| REVIEW | MISTRAL_KEY_1 | Mistral | mistral-small-latest |
| CHIEF | OPENROUTER_KEY_4 | OpenRouter | mistral-7b-instruct:free |

### Fallback Keys (Universal)
- GEMINI_KEY_1 (Google Gemini-2.0-flash)
- GEMINI_KEY_2 (Google Gemini-2.0-flash)

## Token Budget

### Per Article
```
SCOUT:   800 tokens
EXTRACT: 700 tokens
WRITE:   3000 tokens
REVIEW:  1000 tokens
CHIEF:   800 tokens
─────────────────
Total:   6300 tokens
```

### Daily (5 Articles)
```
Groq KEY_1:  800 × 5 = 4,000 / 100,000 = 4% ✅
Groq KEY_2:  700 × 5 = 3,500 / 100,000 = 3.5% ✅
OpenRouter:  4,000 × 5 = 20,000 (free tier) ✅
Nvidia:      800 × 5 = 4,000 (free tier) ✅
─────────────────────────────────────────
Total:       7,500 Groq tokens
Buffer:      92,500 tokens remaining (92.5%)
```

## Error Safeguards

1. **JSON Parse Safety**: Never crashes on malformed JSON
2. **Timeout Safety**: Every API call has timeout (30-90 seconds)
3. **Pipeline Resilience**: Non-critical stages fail safely
4. **Rate Limit Handling**: Intelligent sleep and retry
5. **Token Budget Checking**: Skips provider if budget exceeded

## Testing Status

### Completed ✅
- [x] All 5 agent files created and verified
- [x] All 10 API keys configured
- [x] Nvidia provider integrated
- [x] Pipeline engine updated
- [x] Error safeguards in place
- [x] Old agent files deleted
- [x] Configuration files updated

### Pending ⏳
- [ ] Admin panel verification
- [ ] Prisma migration
- [ ] Single article test
- [ ] 5 articles per day test
- [ ] Zero error verification
- [ ] Documentation completion

## Next Steps

1. **Verify Admin Panel**: Ensure status display works correctly
2. **Run Prisma Migration**: Update database schema
3. **Test Single Article**: Process one article through all 5 stages
4. **Test 5 Articles**: Verify daily throughput and token budget
5. **Verify Zero Errors**: Check logs for any errors
6. **Document**: Complete implementation documentation

## Deployment Checklist

- [ ] All 10 API keys added to `.env`
- [ ] Prisma migration completed
- [ ] Single article test passed
- [ ] 5 articles test passed
- [ ] Zero errors verified
- [ ] Admin panel working
- [ ] Logs monitored
- [ ] Ready for production

## Monitoring

### Admin Panel
- Today's progress: X/5 articles completed
- Engine status: RUNNING or STOPPED
- Current job headline and stage
- Queue status: queued, running, completed, failed, held
- API quota bars: Groq, Google, Mistral
- Sleeping agents: if rate limited

### Logs
- ERROR level messages
- JSON parse failures
- Timeout errors
- API key errors
- Database errors

### Token Budget
- Groq: should be under 10% daily
- OpenRouter: free tier (no quota)
- Nvidia: free tier (no quota)
- Google: should be under 10% daily
- Mistral: should be under 10% daily

## Support

For issues or questions:
1. Check the IMPLEMENTATION-GUIDE.md for detailed architecture
2. Review tasks.md for task status and dependencies
3. Check logs for error messages
4. Verify API keys are configured correctly
5. Test with single article first

## Success Criteria

✅ **Completed**:
- 7 agents merged to 5 agents
- All 10 API keys actively used
- Zero idle keys
- Error safeguards in place
- Old files deleted
- Configuration updated

⏳ **Pending**:
- Zero pipeline errors verified
- 5 articles per day throughput confirmed
- Admin panel working
- All tests passing

🎯 **Final Goal**: Production-ready 5-agent pipeline with zero errors, all 10 keys active, and 5 articles per day throughput.
