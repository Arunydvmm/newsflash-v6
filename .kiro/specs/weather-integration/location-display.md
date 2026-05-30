# Location Display Specification

## Overview
The city location will be prominently displayed in multiple places on the weather page so users always know which city's weather they're viewing.

## Display Locations

### 1. Location Header (Top of Page)
**Visibility:** Always visible, sticky on scroll
**Content:**
```
📍 New York, United States | EST (GMT-5) | Updated 2 mins ago
Coordinates: 40.7128° N, 74.0060° W [Change Location]
```

**Components:**
- City name (bold, large)
- Country name
- Timezone with GMT offset
- Last updated timestamp
- Coordinates (latitude/longitude with degrees)
- "Change Location" button/link

**Styling:**
- Glass-morphism background
- High contrast text for readability
- Icon: 📍 (location pin)
- Responsive: Stack on mobile, inline on desktop

---

### 2. Current Weather Card
**Visibility:** Prominent in main content area
**Content:**
```
┌─────────────────────────────────────┐
│ 📍 CURRENT LOCATION                 │
│ New York, United States             │
│ Lat: 40.7128° | Lon: 74.0060°      │
│ Timezone: EST (GMT-5)               │
│                                     │
│ [Large Temperature Display]         │
│ [Weather Icon]                      │
│ [Condition Text]                    │
└─────────────────────────────────────┘
```

**Components:**
- Location label (small caps, muted)
- City name and country (large, bold)
- Coordinates (monospace font)
- Timezone information
- Current temperature
- Weather condition
- Animated weather icon

**Styling:**
- Part of main weather card
- Consistent with aethercast design
- Clear visual hierarchy

---

### 3. Page Title/Meta
**Visibility:** Browser tab and page metadata
**Content:**
```
Weather in New York, United States - Newsflash
```

**Implementation:**
- Update document.title
- Update meta description
- Update Open Graph tags for sharing

---

## Location Information Details

### City Name
- **Source:** AccuWeather API response
- **Format:** Full city name (e.g., "New York", "Los Angeles")
- **Fallback:** "Your Location" if not available

### Country
- **Source:** Derived from coordinates or API response
- **Format:** Full country name (e.g., "United States", "United Kingdom")
- **Fallback:** "Unknown" if not available

### Coordinates
- **Format:** Decimal degrees with cardinal directions
  - Latitude: `40.7128° N` or `40.7128° S`
  - Longitude: `74.0060° W` or `74.0060° E`
- **Precision:** 4 decimal places (≈ 11 meters accuracy)
- **Display:** Both latitude and longitude always shown

### Timezone
- **Format:** `TIMEZONE_CODE (GMT±X)`
  - Examples: `EST (GMT-5)`, `PST (GMT-8)`, `GMT (GMT+0)`, `IST (GMT+5:30)`
- **Source:** Derived from coordinates using timezone library
- **Fallback:** "Unknown" if not available

### Last Updated
- **Format:** Relative time (e.g., "2 mins ago", "5 mins ago")
- **Update:** Refresh when new data is fetched
- **Display:** In header and optionally in current weather card

---

## Location Change Flow

### User Initiates Location Change
1. User clicks "Change Location" button
2. Location search modal/input appears

### Search Modal
```
┌──────────────────────────────────────┐
│ Search for a city                    │
│ ┌──────────────────────────────────┐ │
│ │ [Search input field]             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Recent Locations:                    │
│ • New York, United States            │
│ • Los Angeles, United States         │
│ • London, United Kingdom             │
│                                      │
│ Search Results:                      │
│ • Paris, France                      │
│ • Tokyo, Japan                       │
│ • Sydney, Australia                  │
└──────────────────────────────────────┘
```

### Location Selection
1. User types city name or coordinates
2. Results appear in real-time
3. User clicks on desired location
4. Modal closes
5. Page fetches new weather data
6. Location info updates
7. Components re-render with new data

---

## Responsive Design

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│ 📍 New York, United States | EST (GMT-5) | Updated 2m  │
│ Coordinates: 40.7128° N, 74.0060° W [Change Location]  │
└─────────────────────────────────────────────────────────┘

[Current Weather Card with location info]
[Forecast Grid]
[Hourly Trend]
[Weather Stats]
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────┐
│ 📍 New York, United States           │
│ EST (GMT-5) | Updated 2m             │
│ Coordinates: 40.7128° N, 74.0060° W  │
│ [Change Location]                    │
└──────────────────────────────────────┘

[Current Weather Card]
[Forecast Grid]
[Hourly Trend]
```

### Mobile (< 768px)
```
┌──────────────────────────┐
│ 📍 New York              │
│ United States            │
│ EST (GMT-5) | Updated 2m │
│ 40.7128° N, 74.0060° W   │
│ [Change Location]        │
└──────────────────────────┘

[Current Weather Card]
[Forecast Grid]
[Hourly Trend]
```

---

## Accessibility

### Screen Readers
- Location information read clearly
- Coordinates announced with proper formatting
- "Change Location" button properly labeled
- Timezone information clear and understandable

### Keyboard Navigation
- "Change Location" button accessible via Tab
- Search modal keyboard navigable
- Location results selectable via keyboard

### Color Contrast
- Location text has sufficient contrast
- Icons visible and distinguishable
- No color-only information

---

## Data Transformation for Location

### Input (AccuWeather API)
```typescript
{
  location: "New York",
  lat: 40.7128,
  lon: -74.0060,
  // ... other weather data
}
```

### Output (Aethercast Format with Location)
```typescript
{
  id: "new_york",
  name: "New York",
  country: "United States",
  latitude: "40.7128° N",
  longitude: "74.0060° W",
  timezone: "EST (GMT-5)",
  // ... forecast data
}
```

### Location Enrichment Process
1. Extract city name from API response
2. Get country from reverse geocoding or API
3. Format coordinates with cardinal directions
4. Determine timezone from coordinates
5. Calculate "last updated" timestamp
6. Pass all to components for display

---

## Implementation Checklist

- [ ] LocationHeader component created
- [ ] Location info added to CurrentWeather component
- [ ] Coordinates formatted correctly (4 decimal places)
- [ ] Timezone detection implemented
- [ ] Last updated timestamp calculated
- [ ] Location search modal created
- [ ] Location change functionality implemented
- [ ] Responsive design tested on all breakpoints
- [ ] Accessibility verified
- [ ] Location info updates on data refresh
- [ ] Mobile display optimized
- [ ] Desktop display optimized
- [ ] Tablet display optimized
