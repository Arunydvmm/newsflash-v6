# Design: Weather Integration Architecture

## Architecture Overview

```
newsflash-v6/
├── app/
│   ├── weather/
│   │   └── page.tsx (NEW - uses aethercast components)
│   └── api/
│       └── weather/
│           └── route.ts (EXISTING - AccuWeather API)
├── components/
│   └── weather/ (NEW)
│       ├── CurrentWeather.tsx (from aethercast)
│       ├── ForecastGrid.tsx (from aethercast)
│       ├── HourlyTrend.tsx (from aethercast)
│       ├── WeatherStats.tsx (from aethercast)
│       ├── SecondaryRow.tsx (from aethercast)
│       ├── WeatherIcon.tsx (from aethercast)
│       └── weatherDataTransformer.ts (NEW - data mapping)
└── lib/
    └── weatherTypes.ts (NEW - type definitions)
```

## Data Flow

```
1. User visits /weather
2. Geolocation → Get user coordinates
3. Fetch /api/weather (POST) with coordinates
4. AccuWeather API returns data
5. weatherDataTransformer converts to aethercast format
6. **EXTRACT LOCATION INFO:**
   - City name from API response
   - Country from coordinates/reverse geocoding
   - Timezone from coordinates
   - Latitude/Longitude from request
7. Components render with transformed data + location info
```

## Component Structure

### Header/Navigation (NEW)
- Display current city name prominently
- Show country and timezone
- Show coordinates (latitude/longitude)
- Display "Last updated" timestamp
- Location search/change button
- Props: city data, onLocationChange callback

### CurrentWeather
- Displays current temperature, condition, location
- Shows high/low temperatures
- Animated weather icon
- **INCLUDES CITY LOCATION DISPLAY:**
  - City name and country
  - Latitude/longitude coordinates
  - Timezone information
- Props: city data, day forecast, isToday flag

### ForecastGrid
- Shows 5-day forecast
- Clickable day selection
- Displays temp, condition, precipitation, wind
- Props: forecast array, selected day index, setter

### HourlyTrend
- 12-hour forecast with chart/trend visualization
- Hourly temperature and condition
- Props: day forecast data

### WeatherStats
- Quick stats sidebar: humidity, wind, pressure, UV index, visibility
- Props: day forecast data

### SecondaryRow
- Additional metrics: sunrise/sunset, AQI, pressure trend
- Props: day forecast data

## Data Transformation Strategy

### Input (AccuWeather API)
```typescript
{
  location: string;
  lat: number;
  lon: number;
  current: {
    temperature: number;
    condition: string;
    icon: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    uvIndex: number;
    visibility: number;
    dewPoint: number;
    feelsLike: number;
    pressure: number;
    windGust: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: number;
    precipitation: number;
    precipitationProbability: number;
    wind: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: number;
    precipitation: number;
    humidity: number;
  }>;
}
```

### Output (Aethercast Format)
```typescript
{
  id: string;
  name: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
  forecast: Array<{
    dayName: string;
    dayShort: string;
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    description: string;
    iconName: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy' | 'stormy';
    pop: number;
    hourly: Array<{
      time: string;
      temp: number;
      condition: string;
      pop: number;
    }>;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    uvIndex: number;
    uvLevel: string;
    visibility: number;
    aqiValue: number;
    aqiLevel: string;
    aqiColor: string;
    sunriseTime: string;
    sunsetTime: string;
    pressureValue: number;
    pressureTrend: string;
  }>;
}
```

## Icon Mapping
AccuWeather icon codes → Aethercast icon names:
- 1-2: sunny
- 3-4: partly_cloudy
- 5-6: rainy
- 7: stormy
- 8+: cloudy/snowy (based on context)

## Dependencies to Add
```json
{
  "motion": "^12.23.24",
  "lucide-react": "^0.546.0"
}
```

## Styling Approach
- Use existing Tailwind CSS from newsflash
- Adapt aethercast's glass-morphism design
- Maintain newsflash color scheme
- Ensure dark mode compatibility

## Location Display UI

### Header Location Bar (Always Visible)
```
📍 City Name, Country | Timezone | Last Updated: 2 mins ago
Coordinates: 40.7128° N, 74.0060° W
```

### Current Weather Card Location Section
```
📍 CURRENT LOCATION
New York, United States
Lat: 40.7128° | Lon: 74.0060°
Timezone: EST (GMT-5)
```

### Location Information Displayed
- **City Name** - Primary identifier (e.g., "New York")
- **Country** - Geographic context (e.g., "United States")
- **Coordinates** - Precise location (latitude/longitude with degrees)
- **Timezone** - Time zone information (e.g., "EST (GMT-5)")
- **Last Updated** - Timestamp of data fetch
- **Search/Change** - Button to search for different location

### Location Change Flow
1. User clicks "Change Location" button
2. Search modal/input appears
3. User enters city name or coordinates
4. Results displayed
5. User selects location
6. Page fetches new weather data
7. Location info updates
8. Components re-render with new data

## Performance Considerations
- Reuse existing API caching (30 min TTL)
- Lazy load animation library
- Memoize transformed data
- Optimize re-renders with React.memo

## Testing Strategy
- Test data transformation with various AccuWeather responses
- Verify component rendering with transformed data
- Test responsive design on mobile/tablet/desktop
- Verify geolocation functionality
- Test error handling and fallback UI
