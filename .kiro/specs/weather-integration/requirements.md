# Weather Integration: Aethercast UI with AccuWeather API

## Overview
Replace the current weather page UI in newsflash with aethercast's modern weather components while maintaining the existing AccuWeather API integration.

## Requirements

### 1. Component Extraction & Adaptation
- Extract aethercast components: CurrentWeather, ForecastGrid, HourlyTrend, WeatherStats, SecondaryRow
- Adapt components to accept AccuWeather data format instead of mock data
- Create data transformation layer to convert AccuWeather API response to aethercast component format

### 2. Data Structure Mapping
**AccuWeather API Response → Aethercast Format:**
- Current weather data → CurrentWeather component
- 5-day forecast → ForecastGrid component
- 12-hour forecast → HourlyTrend component
- Weather metrics (humidity, wind, pressure, etc.) → WeatherStats & SecondaryRow components

### 3. Dependencies
- Keep existing: Next.js, React, Tailwind CSS, AccuWeather API
- Add from aethercast: motion (animations), lucide-react (icons)
- Ensure compatibility with newsflash's existing dependencies

### 4. UI/UX
- Maintain aethercast's modern glass-morphism design
- Adapt color scheme to match newsflash branding (if needed)
- Ensure responsive design works on mobile and desktop
- Keep geolocation and location detection functionality
- **PROMINENTLY DISPLAY CITY LOCATION** - Show which city's weather data is being displayed
  - Display city name, country, and coordinates
  - Show in header/navigation area
  - Show in current weather card
  - Update when user changes location
  - Display timezone information
  - Show "Last updated" timestamp

### 5. API Integration
- Reuse existing `/api/weather` endpoint
- No changes to AccuWeather API calls
- Maintain caching mechanism (30 minutes TTL)
- Keep fallback mock data for errors

### 6. Performance
- Lazy load components where possible
- Maintain existing cache strategy
- Optimize animations for performance

## Success Criteria
- Weather page displays with aethercast UI components
- All weather data from AccuWeather API displays correctly
- Responsive design works on all screen sizes
- Geolocation and manual location selection work
- No breaking changes to existing functionality
- Page loads with acceptable performance
