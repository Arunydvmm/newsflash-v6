# 🚀 Complete Integration Spec - All 3 Features

## Overview
Comprehensive specification for integrating 3 major features into newsflash:
1. **Weather Integration** - Aethercast UI + AccuWeather API
2. **Weather Notifications** - Push notifications for significant changes
3. **AI Research Journalist** - Fact verification + content synthesis

---

## 📋 Feature Summary

### Feature 1: Weather Integration
**Status:** In Progress (Task 1 Complete)
- Replace current weather with aethercast UI
- Use AccuWeather API backend
- Display on homepage + dedicated detailed page
- Prominently show city location (city, country, coordinates, timezone)
- Responsive design for all devices

### Feature 2: Weather Notifications
**Status:** New
- Auto-trigger notifications for significant weather changes
- Significant = storms, extreme temperatures
- Include: current temp, condition, location, link to weather page
- Push notification format
- Store in database with user history
- User-configurable preferences

### Feature 3: AI Research Journalist
**Status:** New
- Integrated into article creation workflow
- Admin pastes article URL → AI verifies → Shows report → Admin publishes
- Uses Google AI Studio API for:
  - ✅ Fact verification (dates, names, statistics)
  - ✅ Generate alternative headlines/summaries
  - ✅ Generate article insights/tags
- Show verification report in admin panel
- Flag suspicious content
- Add "Verified" badge to articles
- Store verification metadata in database

---

## 📁 Spec Files

### Feature 1: Weather Integration
- `weather-integration/requirements.md` - Requirements
- `weather-integration/design.md` - Architecture
- `weather-integration/tasks.md` - Implementation tasks
- `weather-integration/location-display.md` - Location display spec
- `weather-integration/VISUAL-MOCKUP.md` - Visual mockups

### Feature 2: Weather Notifications
- `weather-notifications/requirements.md` - Requirements
- `weather-notifications/design.md` - Architecture
- `weather-notifications/tasks.md` - Implementation tasks
- `weather-notifications/database-schema.md` - Database design
- `weather-notifications/api-endpoints.md` - API specification

### Feature 3: AI Research Journalist
- `ai-research-journalist/requirements.md` - Requirements
- `ai-research-journalist/design.md` - Architecture
- `ai-research-journalist/tasks.md` - Implementation tasks
- `ai-research-journalist/database-schema.md` - Database design
- `ai-research-journalist/api-endpoints.md` - API specification
- `ai-research-journalist/google-ai-integration.md` - Google AI Studio setup

---

## 🎯 Implementation Order

1. **Complete Weather Integration** (continue from Task 1)
   - Tasks 2-8 of weather integration
   - Estimated: 4-6 hours

2. **Add Weather Notifications** (depends on weather integration)
   - Setup notification system
   - Create notification triggers
   - Add push notification service
   - Estimated: 3-4 hours

3. **Add AI Research Journalist** (independent)
   - Setup Google AI Studio integration
   - Create verification workflow
   - Add admin panel tools
   - Estimated: 5-7 hours

**Total Estimated Time:** 12-17 hours

---

## 🏗️ Architecture Overview

```
newsflash-v6/
├── app/
│   ├── weather/
│   │   └── page.tsx (NEW - aethercast UI)
│   ├── api/
│   │   ├── weather/
│   │   │   └── route.ts (UPDATED - AccuWeather)
│   │   ├── notifications/
│   │   │   ├── route.ts (NEW - notification endpoints)
│   │   │   └── weather-alerts.ts (NEW - weather triggers)
│   │   └── ai-verify/
│   │       ├── route.ts (NEW - verification endpoint)
│   │       └── google-ai.ts (NEW - Google AI integration)
│   ├── admin/
│   │   ├── articles/
│   │   │   └── [id]/page.tsx (UPDATED - add AI verification)
│   │   └── ai-verify/
│   │       └── page.tsx (NEW - AI verification tool)
│   └── components/
│       ├── weather/ (NEW - aethercast components)
│       ├── notifications/ (NEW - notification UI)
│       └── ai-verify/ (NEW - verification UI)
├── lib/
│   ├── weatherTypes.ts (CREATED)
│   ├── weatherDataTransformer.ts (CREATED)
│   ├── notificationService.ts (NEW)
│   ├── weatherAlertTrigger.ts (NEW)
│   ├── googleAiService.ts (NEW)
│   └── verificationService.ts (NEW)
├── models/
│   ├── Notification.ts (NEW)
│   ├── WeatherAlert.ts (NEW)
│   ├── ArticleVerification.ts (NEW)
│   └── VerificationReport.ts (NEW)
└── package.json (UPDATED - add dependencies)
```

---

## 📦 New Dependencies

```json
{
  "motion": "^12.23.24",
  "lucide-react": "^0.546.0",
  "@google/generative-ai": "^0.3.0",
  "web-push": "^3.6.7",
  "node-cron": "^3.0.2"
}
```

---

## 🔄 Data Flow

### Weather Integration
```
User visits /weather
  ↓
Geolocation → Get coordinates
  ↓
Fetch /api/weather (POST)
  ↓
AccuWeather API returns data
  ↓
Transform to aethercast format
  ↓
Check for significant changes
  ↓
Trigger notification if needed
  ↓
Render aethercast components with location display
```

### Weather Notifications
```
Weather data fetched
  ↓
Compare with previous data
  ↓
Check if significant change (storm/extreme temp)
  ↓
Create notification object
  ↓
Store in database
  ↓
Send push notification to subscribed users
  ↓
Update notification history
```

### AI Research Journalist
```
Admin pastes article URL
  ↓
Extract article content
  ↓
Send to Google AI Studio API
  ↓
AI verifies facts, generates alternatives, creates insights
  ↓
Display verification report in admin panel
  ↓
Admin reviews and publishes
  ↓
Store verification metadata with article
  ↓
Add "Verified" badge to published article
```

---

## 📊 Database Schema Overview

### New Collections/Tables

1. **Notifications**
   - id, userId, type, title, body, data, read, createdAt

2. **WeatherAlerts**
   - id, location, previousTemp, currentTemp, condition, severity, triggered, createdAt

3. **ArticleVerifications**
   - id, articleId, url, status, verificationScore, report, alternatives, insights, tags, createdAt

4. **VerificationReports**
   - id, verificationId, facts, discrepancies, sources, accuracy, flagged

---

## 🔐 Security Considerations

- ✅ Validate all user inputs
- ✅ Rate limit API endpoints
- ✅ Secure Google AI API key (environment variables)
- ✅ Validate notification subscriptions
- ✅ Sanitize article content before AI processing
- ✅ Store verification reports securely

---

## 📈 Performance Targets

- Weather page load: < 2 seconds
- Notification delivery: < 5 seconds
- AI verification: < 30 seconds
- Admin panel response: < 1 second

---

## ✅ Success Criteria

### Weather Integration
- ✅ Aethercast UI displays correctly
- ✅ Location prominently shown
- ✅ Works on all devices
- ✅ AccuWeather API integrated
- ✅ No breaking changes

### Weather Notifications
- ✅ Notifications trigger for significant changes
- ✅ Include all required info
- ✅ Stored in database
- ✅ User preferences work
- ✅ Push notifications deliver

### AI Research Journalist
- ✅ Verification workflow works
- ✅ Report displays in admin
- ✅ Alternatives generated
- ✅ Insights/tags created
- ✅ Verified badge shows
- ✅ No false positives

---

## 📚 Next Steps

1. Review this overview
2. Read individual feature specs
3. Review tasks.md for each feature
4. Begin implementation in order:
   - Complete weather integration
   - Add weather notifications
   - Add AI research journalist

**Ready to proceed?**
