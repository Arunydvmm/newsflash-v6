# Pipeline Agent Merger: Quick Reference

## 5-Agent Pipeline

```
SCOUT → EXTRACT → WRITE → REVIEW → CHIEF
```

## Agent Details

| Agent | Role | Primary Key | Backup Key | Tokens | Delay |
|-------|------|-------------|-----------|--------|-------|
| SCOUT | Monitor + Research | GROQ_KEY_1 | GROQ_KEY_2 | 800 | 5s |
| EXTRACT | Extract + Verify | GROQ_KEY_2 | GOOGLE_AI_KEY_1 | 700 | 6s |
| WRITE | Article Writer | OPENROUTER_KEY_1 | OPENROUTER_KEY_2 | 3000 | 8s |
| REVIEW | Safety + SEO + Polish | OPENROUTER_KEY_3 | MISTRAL_KEY_1 | 1000 | 5s |
| CHIEF | Chief Editor | NVIDIA_API_KEY | OPENROUTER_KEY_4 | 800 | 0s |

## All 10 API Keys

### Primary Keys (5)
1. **GROQ_KEY_1** → SCOUT primary
2. **GROQ_KEY_2** → EXTRACT primary
3. **OPENROUTER_KEY_1** → WRITE primary
4. **OPENROUTER_KEY_3** → REVIEW primary
5. **NVIDIA_API_KEY** → CHIEF primary

### Backup Keys (5)
6. **GROQ_KEY_2** → SCOUT backup
7. **GOOGLE_AI_KEY_1** → EXTRACT backup
8. **OPENROUTER_KEY_2** → WRITE backup
9. **MISTRAL_KEY_1** → REVIEW backup
10. **OPENROUTER_KEY_4** → CHIEF backup

### Fallback Keys (2)
- **GEMINI_KEY_1** → Universal fallback
- **GEMINI_KEY_2** → Universal fallback

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
Groq:      7,500 tokens (7.5% of 100,000 quota)
OpenRouter: 20,000 tokens (free tier)
Nvidia:     4,000 tokens (free tier)
```

## File Locations

### Agent Files
```
lib/newsroom/agents/
├── agent1-scout.ts
├── agent2-extract.ts
├── agent3-write.ts
├── agent4-review.ts
└── agent5-chief.ts
```

### Configuration Files
```
lib/newsroom/
├── agent-keys.config.ts      (10-key configuration)
├── agent-caller.ts           (provider caller + error handling)
├── pipeline-engine.ts        (5-stage orchestrator)
└── token-budget.ts           (token tracking)
```

### Environment
```
.env.example                  (all 10 keys listed)
.env                          (add your actual keys here)
```

## Error Safeguards

1. **JSON Parse Safety** - Never crashes on bad JSON
2. **Timeout Safety** - 30-90s timeouts per provider
3. **Pipeline Resilience** - Non-critical stages fail safely
4. **Rate Limit Handling** - Intelligent sleep and retry
5. **Token Budget Checking** - Skips provider if budget exceeded

## Timeouts

- Groq: 30 seconds
- OpenRouter: 60 seconds
- Google: 30 seconds
- Mistral: 30 seconds
- Nvidia: 90 seconds

## Key Sharing Map

```
GROQ_KEY_1       → SCOUT primary, EXTRACT backup
GROQ_KEY_2       → EXTRACT primary, SCOUT backup
OPENROUTER_KEY_1 → WRITE primary
OPENROUTER_KEY_2 → WRITE backup
OPENROUTER_KEY_3 → REVIEW primary
OPENROUTER_KEY_4 → CHIEF backup
GOOGLE_AI_KEY_1  → EXTRACT backup
MISTRAL_KEY_1    → REVIEW backup
NVIDIA_API_KEY   → CHIEF primary
GEMINI_KEY_1     → Fallback
GEMINI_KEY_2     → Fallback
```

## Recommendations

### PROCEED
- Continue to next stage
- Article meets quality threshold

### BLOCK
- Stop pipeline
- Article fails safety/quality checks
- Reasons: fake news, low score, bias, legal risk, copyright

### REWRITE
- Send back to previous stage
- Article needs improvement
- Reasons: word count outside range, insufficient tables

### ESCALATE
- Hold for human review
- Article is borderline
- Reasons: any score 0.5-0.65

## Admin Panel

**URL**: `/admin/newsroom`

**Displays**:
- Today's progress: X/5 articles
- Engine status: RUNNING or STOPPED
- Current job headline and stage
- Queue status: queued, running, completed, failed, held
- API quota bars: Groq, Google, Mistral
- Sleeping agents (if rate limited)

**Controls**:
- Trigger Now (fetch RSS and queue articles)
- Stop Engine (pause pipeline)
- Resume (restart pipeline)
- Wipe Data (delete all pipeline data)

## Testing Checklist

- [ ] All 5 agent files exist
- [ ] All 10 API keys configured
- [ ] Nvidia provider working
- [ ] Single article processes through all 5 stages
- [ ] 5 articles process without errors
- [ ] Token budget verified (Groq < 10%)
- [ ] Admin panel displays correctly
- [ ] Zero errors in logs

## Deployment Steps

1. Update `.env` with all 10 API keys
2. Run `npx prisma migrate dev --name five-agent-pipeline`
3. Run `npx prisma generate`
4. Test with single article
5. Monitor logs
6. Enable scheduler

## Monitoring

### Logs to Check
- ERROR level messages
- JSON parse failures
- Timeout errors
- API key errors
- Database errors

### Metrics to Track
- Articles completed per day (target: 5)
- Groq token usage (target: < 10% daily)
- Pipeline errors (target: 0)
- Average processing time per article

## Troubleshooting

### Pipeline Stuck
- Check if engine is running
- Check if slot is available
- Check logs for errors

### API Errors
- Verify all 10 keys are in `.env`
- Check key format (should be long strings)
- Verify provider endpoints are correct

### Token Budget Exceeded
- Check Groq usage in admin panel
- Reduce articles per day if needed
- Check for infinite loops

### JSON Parse Errors
- Check agent output format
- Verify JSON is valid
- Check for thinking tags (Nvidia)

## Key Contacts

For issues:
1. Check logs first
2. Review IMPLEMENTATION-GUIDE.md
3. Check tasks.md for status
4. Verify API keys are correct

## Success Indicators

✅ **Pipeline is working if**:
- Articles process through all 5 stages
- No ERROR level logs
- Admin panel shows progress
- Token budget under 10%
- 5 articles complete per day

❌ **Pipeline has issues if**:
- Articles stuck at any stage
- ERROR level logs present
- Admin panel shows errors
- Token budget exceeded
- Articles not completing

## Quick Commands

```bash
# Check if build works
npm run build

# Run Prisma migration
npx prisma migrate dev --name five-agent-pipeline

# Generate Prisma client
npx prisma generate

# Check logs
tail -f logs/pipeline.log

# Test single article
curl -X POST /api/newsroom/test/single-article
```

## Key Models

| Agent | Provider | Model |
|-------|----------|-------|
| SCOUT | Groq | llama-3.3-70b-versatile |
| EXTRACT | Groq | llama-3.3-70b-versatile |
| WRITE | OpenRouter | mistralai/mistral-7b-instruct:free |
| REVIEW | OpenRouter | mistralai/mistral-7b-instruct:free |
| CHIEF | Nvidia | nvidia/nemotron-3-nano-omni-30b-a3b-reasoning |

## Provider Endpoints

- **Groq**: `https://api.groq.com/openai/v1/chat/completions`
- **OpenRouter**: `https://openrouter.ai/api/v1/chat/completions`
- **Google**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Mistral**: `https://api.mistral.ai/v1/chat/completions`
- **Nvidia**: `https://integrate.api.nvidia.com/v1/chat/completions`

## Status

**Overall**: 54% Complete (7/13 tasks)

**Completed**:
- ✅ Agent files created
- ✅ Keys configured
- ✅ Nvidia integrated
- ✅ Error safeguards
- ✅ Old files deleted
- ✅ Configuration updated
- ✅ Spec documentation

**Pending**:
- ⏳ Admin panel verification
- ⏳ Prisma migration
- ⏳ Single article test
- ⏳ 5 articles test
- ⏳ Zero error verification
- ⏳ Documentation completion

**Next**: Run Prisma migration and test with single article.
