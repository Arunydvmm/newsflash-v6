# AI Research Journalist - Requirements

## Overview
Implement an AI-powered content verification and synthesis system integrated into the article creation workflow. Uses Google AI Studio API to verify facts, generate alternative headlines/summaries, and create article insights/tags.

## Requirements

### 1. Verification Workflow
- **Input:** Admin pastes article URL
- **Process:**
  1. Extract article content from URL
  2. Send to Google AI Studio API
  3. AI verifies facts against sources
  4. AI generates alternative headlines
  5. AI generates alternative summaries
  6. AI creates article insights
  7. AI generates relevant tags
  8. Display comprehensive report
- **Output:** Admin reviews and publishes

### 2. Fact Verification
- **What to Verify:**
  - Dates and timelines
  - Names and entities
  - Statistics and numbers
  - Claims and statements
  - Quotes and attributions

- **Verification Process:**
  - Cross-reference with official sources
  - Check against secondary sources
  - Identify discrepancies
  - Flag suspicious claims
  - Rate accuracy (Verified/Partially Corrected/Disputed)

- **Output:**
  - List of verified facts
  - List of discrepancies found
  - Accuracy rating
  - Source citations
  - Correction suggestions

### 3. Alternative Headlines
- **Generate:** 3-5 alternative headlines
- **Requirements:**
  - SEO-optimized
  - Engaging and clickable
  - Accurate to content
  - Different angles/perspectives
  - Varying lengths (short/medium/long)

- **Display:** Show alternatives with ratings
- **Selection:** Admin can choose or keep original

### 4. Alternative Summaries
- **Generate:** 2-3 alternative summaries
- **Requirements:**
  - Different writing styles
  - Varying lengths (short/medium)
  - Capture key points
  - Engaging and clear
  - SEO-friendly

- **Display:** Show alternatives with word counts
- **Selection:** Admin can choose or keep original

### 5. Article Insights
- **Generate:**
  - Key takeaways (3-5 points)
  - Main entities mentioned
  - Sentiment analysis
  - Content category/topic
  - Target audience
  - Recommended reading level

- **Display:** Show insights in report
- **Use:** Help admin understand article better

### 6. Article Tags
- **Generate:** 5-10 relevant tags
- **Requirements:**
  - Topic-based tags
  - Entity-based tags
  - Sentiment tags
  - Category tags
  - Trending tags

- **Display:** Show suggested tags
- **Selection:** Admin can add/remove tags

### 7. Verification Report
- **Components:**
  - Verification status (Verified/Partially Corrected/Disputed)
  - Accuracy rating (percentage)
  - Facts verified (list)
  - Discrepancies found (list)
  - Sources consulted (links)
  - Alternative headlines (with ratings)
  - Alternative summaries (with word counts)
  - Article insights (key points, entities, sentiment)
  - Suggested tags (with relevance scores)
  - Flagged content (if any)
  - Recommendations (if any)

- **Display:** Clean, readable format in admin panel
- **Export:** Option to export as PDF

### 8. Content Flagging
- **Flag for:**
  - Misinformation detected
  - Unverified claims
  - Suspicious sources
  - Plagiarism indicators
  - Bias detection
  - Outdated information

- **Severity Levels:**
  - Critical (block publication)
  - High (require review)
  - Medium (warning)
  - Low (informational)

- **Admin Action:**
  - Review flagged content
  - Make corrections
  - Override flags if needed
  - Add notes/comments

### 9. Verified Badge
- **Display:** "Verified" badge on published articles
- **Criteria:** Article passed verification with high accuracy
- **Visibility:** Homepage, article page, search results
- **Metadata:** Show verification date and score

### 10. Database Storage
- **Store:**
  - Verification reports
  - Verification scores
  - Alternative headlines/summaries
  - Article insights
  - Suggested tags
  - Flagged content
  - Verification history
  - Admin notes

- **Tracking:**
  - Verification date
  - Verification duration
  - Admin who published
  - Verification version

### 11. Google AI Studio Integration
- **API Usage:**
  - Fact verification
  - Content analysis
  - Alternative generation
  - Insight extraction
  - Tag generation

- **Configuration:**
  - API key management
  - Rate limiting
  - Error handling
  - Retry logic
  - Timeout handling

- **Optimization:**
  - Cache results
  - Batch processing
  - Async operations
  - Cost optimization

### 12. Admin Panel Integration
- **Location:** New tab in admin articles section
- **Access:** Admin users only
- **Workflow:**
  1. Click "Verify with AI" button
  2. Paste article URL
  3. Wait for verification (show progress)
  4. Review report
  5. Make edits if needed
  6. Publish article

- **UI Components:**
  - URL input field
  - Progress indicator
  - Report display
  - Edit interface
  - Publish button

### 13. Performance
- **Verification Time:** < 30 seconds
- **Report Display:** < 2 seconds
- **Database Queries:** < 1 second
- **API Response:** < 20 seconds

### 14. Error Handling
- **Network Errors:** Retry with exponential backoff
- **API Errors:** Show user-friendly error messages
- **Timeout:** Graceful timeout with retry option
- **Invalid URLs:** Validate and show error
- **Rate Limiting:** Queue requests if needed

### 15. Security
- **API Key:** Secure storage (environment variables)
- **Data:** Encrypt sensitive data
- **Access:** Admin authentication required
- **Audit:** Log all verification activities
- **Privacy:** Don't store article content unnecessarily

## Success Criteria

✅ Verification workflow works end-to-end
✅ Facts verified accurately
✅ Alternative headlines generated
✅ Alternative summaries generated
✅ Article insights created
✅ Tags generated and relevant
✅ Verification report displays correctly
✅ Content flagging works
✅ Verified badge shows on articles
✅ Database stores all data
✅ Google AI integration works
✅ Admin panel integrated
✅ Performance targets met
✅ Error handling robust
✅ Security measures in place
