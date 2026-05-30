I have Next.js 14 + MongoDB + Mongoose project.
I have /lib/newsroom/gemini.ts and /lib/newsroom/groq.ts already.
Create ONE new file only: /lib/newsroom/agents.ts
Do not touch any existing files.

This file exports 11 agent functions.
Each agent takes (article: any) and returns:
{ modifiedContent, report, confidence, recommendation }
recommendation: 'PROCEED' | 'ESCALATE' | 'BLOCK'

import { callGemini } from './gemini'
import { callGroq } from './groq'

// AGENT 1 - MONITORING
export async function monitoringAgent(article: any) {
  const result = await callGroq(
    'You are a news monitoring AI for Indian news. Return JSON only.',
    `Analyze: Title: ${article.title}\nSource: ${article.sourceName}\nSnippet: ${article.contentSnippet}\n
Return ONLY JSON: { "modifiedContent": "improved headline", "newsworthinessScore": 0-100, "priority": "BREAKING|STANDARD|FEATURE", "category": "India|World|Business|Technology|Sports|Science|Health|Entertainment|Opinion|Cricket|Sarkari|Education", "isBreaking": boolean, "monitoringNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED|IGNORE" }`,
    0.2
  )
  return { modifiedContent: result.modifiedContent || article.title, report: result, confidence: result.confidence || 0.7, recommendation: result.recommendation === 'IGNORE' ? 'BLOCK' : 'PROCEED' }
}

// AGENT 2 - RESEARCH
export async function researchAgent(article: any) {
  const result = await callGemini(
    'You are a research AI for an Indian news outlet. Return JSON only.',
    `Research this story and return JSON:\nTitle: ${article.title}\nContent: ${article.content || article.contentSnippet}\n
Return ONLY JSON: { "modifiedContent": "article with added background context paragraph", "backgroundContext": "2-3 sentences of background", "keyStakeholders": ["person1","org1"], "researchNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED|ESCALATE" }`,
    0.3
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.7, recommendation: result.recommendation || 'PROCEED' }
}

// AGENT 3 - EXTRACTION
export async function extractionAgent(article: any) {
  const result = await callGroq(
    'You are a data extraction AI. NEVER copy source text verbatim. Extract facts only. Paraphrase everything. Return JSON only.',
    `Extract from this article:\n${article.content || article.contentSnippet}\n
Return ONLY JSON: { "modifiedContent": "article with facts structured clearly", "keyFacts": ["fact1","fact2"], "namedEntities": ["name1"], "paraphrasedQuotes": [{"attribution":"source","quote":"paraphrased text"}], "confidence": 0.0-1.0, "recommendation": "PROCEED" }`,
    0.1
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.8, recommendation: 'PROCEED' }
}

// AGENT 4 - FACT CHECK (HARD GATE)
export async function factCheckAgent(article: any) {
  const result = await callGemini(
    'You are a strict fact-checking AI. Be conservative. Mark uncertain claims UNVERIFIED. Return JSON only.',
    `Fact check this article:\n${article.content}\n
Return ONLY JSON: { "modifiedContent": "article with unverified claims removed or flagged", "claimsVerified": 0, "claimsUnverified": 0, "claimsFalse": 0, "overallConfidence": 0.0-1.0, "falseClaimsFound": boolean, "factCheckNotes": "brief notes", "recommendation": "PROCEED|REWRITE|BLOCK" }`,
    0.1
  )
  const rec = result.falseClaimsFound ? 'BLOCK' : (result.overallConfidence < 0.80 ? 'ESCALATE' : 'PROCEED')
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.overallConfidence || 0.7, recommendation: rec }
}

// AGENT 5 - JOURNALIST
export async function journalistAgent(article: any) {
  const result = await callGemini(
    'You are a professional Indian news journalist. Write factual unbiased articles. Never speculate. AP style. Return JSON only.',
    `Write a full news article from these facts:\n${article.content}\nCategory: ${article.category}\n
Return ONLY JSON: { "modifiedContent": "full article with headline, lead paragraph, body, and source citations", "summary": "2 sentence summary", "keyHighlights": ["highlight1","highlight2","highlight3"], "tags": ["tag1","tag2"], "wordCount": 0, "draftNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED|ESCALATE" }`,
    0.4
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.8, recommendation: result.recommendation || 'PROCEED' }
}

// AGENT 6 - EDITOR
export async function editorAgent(article: any) {
  const result = await callGemini(
    'You are a senior news editor. Improve clarity and structure. Remove speculation. AP style. Return JSON only.',
    `Edit this article:\n${article.content}\n
Return ONLY JSON: { "modifiedContent": "improved full article", "changesMade": ["change1","change2"], "removedSpeculation": ["removed1"], "editorialNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED|REWRITE" }`,
    0.4
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.8, recommendation: result.recommendation || 'PROCEED' }
}

// AGENT 7 - BIAS REVIEW
export async function biasAgent(article: any) {
  const result = await callGemini(
    'You are a bias detection AI for Indian news. Detect and correct all bias. Return JSON only.',
    `Check this article for bias:\n${article.content}\n
Return ONLY JSON: { "modifiedContent": "bias-corrected article", "biasDetected": boolean, "biasTypes": ["type1"], "politicalLean": "LEFT|CENTER|RIGHT|NEUTRAL", "paragraphsRewritten": 0, "biasNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED|REWRITE" }`,
    0.2
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.8, recommendation: result.recommendation || 'PROCEED' }
}

// AGENT 8 - LEGAL (VETO POWER)
export async function legalAgent(article: any) {
  const result = await callGemini(
    'You are a strict Indian media law AI. Check for defamation, contempt, communal incitement, privacy violations, content about minors. Be extremely conservative. Return JSON only.',
    `Legal review of this article:\n${article.content}\n
Return ONLY JSON: { "modifiedContent": "legally safe article", "riskLevel": "CLEAR|LOW|MEDIUM|HIGH|BLOCKED", "defamationRisk": boolean, "communalRisk": boolean, "contemptRisk": boolean, "privacyRisk": boolean, "minorsMentioned": boolean, "flaggedSections": ["section1"], "mandatoryEdits": ["edit1"], "legalVerdict": "CLEAR|REWRITE_REQUIRED|BLOCKED", "blockReason": null, "confidence": 0.0-1.0, "recommendation": "PROCEED|REWRITE|BLOCK" }`,
    0.1
  )
  const isBlocked = result.riskLevel === 'BLOCKED' || result.defamationRisk || result.communalRisk || result.minorsMentioned
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.9, recommendation: isBlocked ? 'BLOCK' : result.recommendation || 'PROCEED' }
}

// AGENT 9 - COPYRIGHT (VETO POWER)
export async function copyrightAgent(article: any) {
  const result = await callGemini(
    'You are a copyright protection AI. Detect verbatim copying and plagiarism. Be strict. Return JSON only.',
    `Copyright check of this article:\n${article.content}\nOriginal source snippet: ${article.contentSnippet || ''}\n
Return ONLY JSON: { "modifiedContent": "copyright-safe article", "plagiarismScore": 0.0-1.0, "verbatimCopying": boolean, "aiLaunderedContent": boolean, "flaggedSegments": ["segment1"], "copyrightVerdict": "CLEAR|REWRITE_REQUIRED|BLOCKED", "blockReason": null, "confidence": 0.0-1.0, "recommendation": "PROCEED|REWRITE|BLOCK" }`,
    0.1
  )
  const isBlocked = result.plagiarismScore > 0.60 || result.verbatimCopying
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.9, recommendation: isBlocked ? 'BLOCK' : result.recommendation || 'PROCEED' }
}

// AGENT 10 - SEO
export async function seoAgent(article: any) {
  const result = await callGroq(
    'You are an SEO expert for Indian news. No clickbait. Return JSON only.',
    `Generate SEO data for:\nTitle: ${article.title}\nContent: ${article.content}\nCategory: ${article.category}\n
Return ONLY JSON: { "modifiedContent": "${article.content}", "metaDescription": "max 160 chars", "slug": "url-safe-slug", "primaryKeyword": "keyword", "secondaryKeywords": ["kw1","kw2"], "seoScore": 0-100, "socialPosts": { "twitter": "max 280 chars", "whatsapp": "2-3 sentences", "facebook": "3-4 sentences" }, "confidence": 0.0-1.0, "recommendation": "PROCEED" }`,
    0.5
  )
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.9, recommendation: 'PROCEED' }
}

// AGENT 11 - CHIEF EDITOR (FINAL GATE)
export async function chiefEditorAgent(article: any) {
  const result = await callGemini(
    'You are a chief editor. Final quality check. Grade the article. Return JSON only.',
    `Final review of this article:\nTitle: ${article.title}\nContent: ${article.content}\nLegal: ${article.legalVerdict}\nCopyright: ${article.copyrightVerdict}\nConfidence: ${article.overallConfidence}\n
Return ONLY JSON: { "modifiedContent": "final polished article", "editorialGrade": "A|B|C|REWRITE|REJECT", "allStagesVerified": boolean, "inconsistenciesFound": ["issue1"], "finalNotes": "brief notes", "confidence": 0.0-1.0, "recommendation": "PROCEED_TO_HUMAN|REWRITE|REJECT" }`,
    0.3
  )
  const isBlocked = result.editorialGrade === 'REJECT'
  return { modifiedContent: result.modifiedContent || article.content, report: result, confidence: result.confidence || 0.8, recommendation: isBlocked ? 'BLOCK' : 'PROCEED' }
}