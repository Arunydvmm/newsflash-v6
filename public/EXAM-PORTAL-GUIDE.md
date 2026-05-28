# Exam Portal System — Complete Guide

## Overview

The Exam Portal is a comprehensive system for managing and displaying exam-related content including:
- **Job Notifications** — Government job announcements
- **Admit Cards** — Download admit cards for exams
- **Answer Keys** — Official answer keys for exams
- **Results** — Exam results and merit lists
- **Exam Dates** — Important exam dates and schedules

## Features

### Frontend (`/exams`)
- **Featured Section** — Highlighted important updates
- **Type-based Navigation** — Filter by notification type
- **Category Filtering** — SSC, UPSC, Railway, Bank, Police, Defence, Teaching, State, PSU, GATE, JEE, NEET, Other
- **Quick Links** — Direct links to apply, download admit cards, answer keys, and results
- **Countdown Timer** — Shows days remaining for important dates
- **Responsive Design** — Works on all devices

### Admin Panel (`/admin/exam-portal`)
- **Table View** — Manage all exam items
- **Type Filtering** — Filter by notification type
- **Category Filtering** — Filter by exam category
- **Search** — Full-text search across titles and organizations
- **Featured Toggle** — Mark items as featured
- **Quick Actions** — Edit and delete items
- **Bulk Management** — Manage multiple items

### Admin Form (`/admin/exam-portal/new` or `/admin/exam-portal/[id]`)
- **Basic Information** — Title, type, organization, exam name, category, state
- **Important Dates** — Notification date, registration dates, exam date, admit card date, answer key date, result date
- **Job Details** — Vacancies, salary, age limits, qualifications (for job notifications)
- **Links & Resources** — Official website, apply link, admit card link, answer key link, result link, PDF
- **Content** — Description, eligibility, how to apply
- **Tags & Featured** — Add tags and mark as featured

## Data Model

### ExamPortal Schema

```typescript
{
  title: String (required),
  slug: String (unique),
  type: Enum ['job-notification', 'admit-card', 'answer-key', 'result', 'exam-date'],
  organization: String (required),
  examName: String (required),
  category: Enum ['SSC', 'UPSC', 'Railway', 'Bank', 'Police', 'Defence', 'Teaching', 'State', 'PSU', 'GATE', 'JEE', 'NEET', 'Other'],
  state: String (default: 'All India'),
  
  // Job Details
  totalVacancy: Number,
  qualification: [String],
  salaryText: String,
  ageMin: Number,
  ageMax: Number,
  
  // Links
  admitCardLink: String,
  answerKeyLink: String,
  resultLink: String,
  officialWebsite: String,
  applyLink: String,
  notificationPdf: String,
  
  // Important Dates
  importantDates: {
    notificationDate: Date,
    registrationStart: Date,
    registrationEnd: Date,
    examDate: Date,
    admitCardDate: Date,
    answerKeyDate: Date,
    resultDate: Date,
  },
  
  // Content
  description: String,
  eligibility: String,
  howToApply: String,
  
  // Metadata
  tags: [String],
  views: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  isExpired: Boolean,
  postedBy: ObjectId (ref: Employee),
  createdAt: Date,
  updatedAt: Date,
}
```

## API Endpoints

### GET `/api/exam-portal`
Fetch exam portal items with filtering and pagination.

**Query Parameters:**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20)
- `type` — Filter by type (job-notification, admit-card, answer-key, result, exam-date)
- `category` — Filter by category (SSC, UPSC, Railway, etc.)
- `search` — Full-text search
- `status` — Filter by status

**Response:**
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

### POST `/api/exam-portal`
Create a new exam portal item (requires authentication).

**Request Body:**
```json
{
  "title": "SSC CGL 2026 Notification",
  "type": "job-notification",
  "organization": "Staff Selection Commission",
  "examName": "Combined Graduate Level",
  "category": "SSC",
  "state": "All India",
  "totalVacancy": 1200,
  "salaryText": "Rs. 25,500 - 81,100",
  "importantDates": {
    "notificationDate": "2026-05-28",
    "registrationStart": "2026-06-01",
    "registrationEnd": "2026-06-30",
    "examDate": "2026-08-15"
  },
  "applyLink": "https://ssc.nic.in/apply",
  "officialWebsite": "https://ssc.nic.in",
  "isFeatured": true
}
```

### GET `/api/exam-portal/[id]`
Fetch a specific exam portal item.

### PUT `/api/exam-portal/[id]`
Update an exam portal item (requires authentication).

### DELETE `/api/exam-portal/[id]`
Delete an exam portal item (requires authentication).

## How to Use

### Adding a New Exam Item

1. **Go to Admin Panel**
   - Navigate to `/admin/exam-portal`
   - Click "+ New Item"

2. **Fill in Basic Information**
   - Title: "SSC CGL 2026 Notification"
   - Type: "Job Notification"
   - Organization: "Staff Selection Commission"
   - Exam Name: "Combined Graduate Level"
   - Category: "SSC"
   - State: "All India"

3. **Add Important Dates**
   - Notification Date: When the notification was released
   - Registration Start: When applications open
   - Registration End: Last date to apply
   - Exam Date: When the exam will be held
   - Admit Card Date: When admit cards will be available
   - Answer Key Date: When answer keys will be released
   - Result Date: When results will be announced

4. **Add Job Details (if job notification)**
   - Total Vacancies: Number of positions
   - Salary: Salary range
   - Age Limits: Minimum and maximum age
   - Qualifications: Required qualifications

5. **Add Links**
   - Official Website: Link to official website
   - Apply Link: Direct link to apply
   - Admit Card Link: Link to download admit card
   - Answer Key Link: Link to download answer key
   - Result Link: Link to check results
   - Notification PDF: Link to official notification PDF

6. **Add Content**
   - Description: Brief description of the exam
   - Eligibility: Eligibility criteria
   - How to Apply: Step-by-step application process

7. **Add Tags and Mark as Featured**
   - Tags: Add relevant tags (e.g., "SSC", "2026", "Government Job")
   - Featured: Check if this should be featured on homepage

8. **Save**
   - Click "Save" to create the item

### Filtering and Searching

**On Frontend (`/exams`):**
- Click on type icons to filter by type
- Use search bar to search by title or organization
- Click on category cards to filter by category

**On Admin Panel (`/admin/exam-portal`):**
- Use dropdown filters for type and category
- Use search box for full-text search
- Click "Featured" button to toggle featured status

### Managing Items

**Edit:**
- Click "Edit" button in admin panel
- Make changes and click "Save"

**Delete:**
- Click "Delete" button in admin panel
- Confirm deletion

**Feature:**
- Click the star icon (☆/⭐) to toggle featured status

## Best Practices

1. **Keep Titles Clear and Descriptive**
   - ✓ "SSC CGL 2026 Notification — 1200 Vacancies"
   - ✗ "SSC Notification"

2. **Add All Important Dates**
   - Helps users track deadlines
   - Enables countdown timer on frontend

3. **Provide Direct Links**
   - Link to official website
   - Link to apply directly
   - Link to download documents

4. **Use Appropriate Categories**
   - Choose the correct exam category
   - Helps users filter by exam type

5. **Add Relevant Tags**
   - Use tags like exam name, year, exam type
   - Helps with search and discovery

6. **Mark Important Items as Featured**
   - Featured items appear at the top
   - Use for urgent notifications and popular exams

7. **Keep Content Updated**
   - Update dates as they change
   - Add links as they become available
   - Mark as expired when no longer relevant

## Frontend Display

### Featured Section
- Shows up to 8 featured items
- Displays type, organization, category
- Shows countdown timer
- Provides quick action buttons (Apply, Admit Card, Answer Key, Result)

### Main List
- Shows all items sorted by featured status and date
- Displays type, category, organization
- Shows countdown timer
- Provides quick action buttons
- Responsive grid layout

### Type Navigation
- Filter by: Job Notification, Admit Card, Answer Key, Result, Exam Date
- Shows count of items for each type

### Category Stats
- Shows count of items for each category
- Clickable to filter by category

## Integration with Homepage

The Exam Portal is integrated into the homepage as a portal card:
- **Icon:** 📚
- **Label:** Exam Portal
- **Description:** Answer Keys · Admit Cards · Results · Notifications
- **Link:** `/exams`

Users can click on the portal card to access the exam portal.

## Troubleshooting

### Items Not Showing
- Check if `isActive` is set to `true`
- Check if `isExpired` is set to `false`
- Verify the item has been saved

### Links Not Working
- Verify the URL is correct and starts with `https://`
- Test the link in a new tab
- Check if the external website is accessible

### Dates Not Showing Countdown
- Ensure `importantDates.examDate` is set
- Verify the date is in the future
- Check if the date format is correct (YYYY-MM-DD)

### Search Not Working
- Ensure the item has been indexed (may take a few seconds)
- Try searching by organization name
- Check if the search term exists in title or organization

## Future Enhancements

- Bulk import from CSV
- Email notifications for important dates
- User subscriptions to specific exams
- Detailed exam pages with full information
- Exam preparation resources
- Mock tests and practice papers
- Discussion forums for each exam
- Result analysis and cutoff predictions
