/**
 * Weather Data Transformer
 * Converts AccuWeather API responses to Aethercast format
 */

import { AccuWeatherResponse, CityData, DayForecast, HourlyForecast } from './weatherTypes';

/**
 * Map AccuWeather icon codes to aethercast icon names
 */
function mapWeatherIcon(iconCode: number | undefined): 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy' | 'stormy' {
  if (!iconCode) return 'cloudy';

  // AccuWeather icon mapping
  if (iconCode === 1 || iconCode === 2) return 'sunny';
  if (iconCode === 3 || iconCode === 4) return 'partly_cloudy';
  if (iconCode === 5 || iconCode === 6 || iconCode === 12 || iconCode === 18) return 'rainy';
  if (iconCode === 7 || iconCode === 8 || iconCode === 11) return 'cloudy';
  if (iconCode === 13 || iconCode === 14 || iconCode === 16 || iconCode === 19 || iconCode === 20 || iconCode === 21 || iconCode === 22 || iconCode === 23 || iconCode === 24 || iconCode === 25 || iconCode === 26 || iconCode === 29) return 'snowy';
  if (iconCode === 15 || iconCode === 17 || iconCode === 37 || iconCode === 38 || iconCode === 39 || iconCode === 40 || iconCode === 41 || iconCode === 42 || iconCode === 43 || iconCode === 44) return 'stormy';

  return 'cloudy';
}

/**
 * Format coordinates with cardinal directions
 */
function formatCoordinates(lat: number, lon: number): { latitude: string; longitude: string } {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';

  return {
    latitude: `${Math.abs(lat).toFixed(4)}° ${latDirection}`,
    longitude: `${Math.abs(lon).toFixed(4)}° ${lonDirection}`,
  };
}

/**
 * Get timezone from coordinates (simplified - in production, use a timezone library)
 */
function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // Simplified timezone mapping based on longitude
  // In production, use a proper timezone library like 'timezone-support' or 'tz-lookup'
  
  const offset = Math.round(lon / 15);
  const sign = offset >= 0 ? '+' : '';
  
  // Common timezone abbreviations
  const timezoneMap: Record<number, string> = {
    '-8': 'PST (GMT-8)',
    '-7': 'MST (GMT-7)',
    '-6': 'CST (GMT-6)',
    '-5': 'EST (GMT-5)',
    '0': 'GMT (GMT+0)',
    '1': 'CET (GMT+1)',
    '2': 'EET (GMT+2)',
    '5': 'IST (GMT+5)',
    '5.5': 'IST (GMT+5:30)',
    '8': 'SGT (GMT+8)',
    '9': 'JST (GMT+9)',
  };

  return timezoneMap[offset.toString()] || `GMT${sign}${offset}`;
}

/**
 * Calculate relative time (e.g., "2 mins ago")
 */
function getRelativeTime(date: Date = new Date()): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Get AQI color based on AQI level
 */
function getAQIColor(level: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR'): string {
  const colorMap = {
    EXCELLENT: 'text-[#4ade80]', // green
    GOOD: 'text-[#eab308]', // yellow
    MODERATE: 'text-[#f97316]', // orange
    POOR: 'text-[#f87171]', // red
  };
  return colorMap[level] || 'text-[#4ade80]';
}

/**
 * Get AQI level based on AQI value
 */
function getAQILevel(value: number): 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' {
  if (value <= 50) return 'EXCELLENT';
  if (value <= 100) return 'GOOD';
  if (value <= 150) return 'MODERATE';
  return 'POOR';
}

/**
 * Get UV level description
 */
function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '1-2 (Low)';
  if (uvIndex <= 5) return '3-5 (Moderate)';
  if (uvIndex <= 7) return '6-7 (High)';
  if (uvIndex <= 10) return '8-10 (Very High)';
  return '11+ (Extreme)';
}

/**
 * Format date from ISO string to readable format
 */
function formatDateDisplay(isoString: string): string {
  try {
    if (!isoString || typeof isoString !== 'string') return 'Unknown';
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Get day name from ISO string
 */
function getDayName(isoString: string, isToday: boolean = false): string {
  if (isToday) return 'Today';
  try {
    if (!isoString || typeof isoString !== 'string') return 'Unknown';
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return 'Unknown';
  }
}

/**
 * Get day short name from ISO string
 */
function getDayShort(isoString: string, isToday: boolean = false): string {
  if (isToday) return 'TODAY';
  try {
    if (!isoString || typeof isoString !== 'string') return 'UNKNOWN';
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'UNKNOWN';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Format time from ISO string to HH:MM format
 */
function formatTime(isoString: string): string {
  try {
    if (!isoString || typeof isoString !== 'string') return '00:00';
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '00:00';
    
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '00:00';
  }
}

/**
 * Format date from ISO string to "Mon DD" format
 */
function formatDate(isoString: string): string {
  try {
    if (!isoString || typeof isoString !== 'string') return 'Unknown';
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

/**
 * Transform hourly forecast data
 */
function transformHourlyForecast(hourlyData: any[]): HourlyForecast[] {
  if (!hourlyData || hourlyData.length === 0) {
    return [];
  }

  return hourlyData.slice(0, 12).map((hour) => {
    // Handle both mock and API data formats
    let temp = hour.temperature || hour.Temperature?.Metric?.Value || 0;
    
    // Ensure temperature is valid (not 0 or negative unrealistic values)
    if (temp === 0 || temp < -50) {
      temp = 20; // Default fallback
    }

    const timeStr = hour.time || hour.DateTime;
    const formattedTime = formatTime(timeStr);

    return {
      time: formattedTime,
      temp: Math.round(temp),
      condition: mapWeatherIcon(hour.icon || hour.WeatherIcon),
      pop: hour.humidity || hour.RelativeHumidity || 0,
    };
  });
}

/**
 * Transform daily forecast data
 */
function transformDailyForecast(
  forecastData: any[],
  hourlyData: any[],
  lat: number,
  lon: number
): DayForecast[] {
  if (!forecastData || forecastData.length === 0) {
    return [];
  }

  return forecastData.slice(0, 5).map((day, index) => {
    const isToday = index === 0;
    const dayHourly = isToday ? transformHourlyForecast(hourlyData) : [];
    
    // Ensure valid temperatures - reject 0 or unrealistic values
    let tempMax = day.high || day.Temperature?.Maximum?.Value || 25;
    let tempMin = day.low || day.Temperature?.Minimum?.Value || 15;

    // Validate temperatures
    if (tempMax === 0 || tempMax < -50 || tempMax > 60) {
      tempMax = 25; // Default fallback
    }
    if (tempMin === 0 || tempMin < -50 || tempMin > 60) {
      tempMin = 15; // Default fallback
    }

    // Ensure min is less than max
    if (tempMin > tempMax) {
      [tempMin, tempMax] = [tempMax, tempMin];
    }

    const dateStr = day.date || day.Date;
    const formattedDate = formatDate(dateStr);
    const dayName = getDayName(dateStr, isToday);
    const dayShort = getDayShort(dateStr, isToday);

    return {
      dayName,
      dayShort,
      date: formattedDate,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      condition: day.condition || day.Day?.IconPhrase || 'Unknown',
      description: `${day.condition || day.Day?.IconPhrase || 'Unknown'} conditions expected.`,
      iconName: mapWeatherIcon(day.icon || day.Day?.Icon),
      pop: day.precipitationProbability || day.Day?.PrecipitationProbability || 0,
      hourly: dayHourly,
      humidity: 65,
      windSpeed: Math.round(day.wind || day.Day?.Wind?.Speed?.Metric?.Value || 0),
      windDirection: 'N',
      uvIndex: 5,
      uvLevel: getUVLevel(5),
      visibility: 10,
      aqiValue: 50,
      aqiLevel: getAQILevel(50),
      aqiColor: getAQIColor('GOOD'),
      sunriseTime: '05:42',
      sunsetTime: '18:30',
      pressureValue: 1013,
      pressureTrend: 'Stable',
    };
  });
}

/**
 * Main transformer function
 * Converts AccuWeather API response to Aethercast CityData format
 */
export function transformAccuWeatherData(
  accuWeatherData: AccuWeatherResponse,
  cityName: string,
  country: string = 'Unknown'
): CityData {
  const { lat, lon, current, forecast, hourly } = accuWeatherData;

  // Format coordinates
  const { latitude, longitude } = formatCoordinates(lat, lon);

  // Get timezone
  const timezone = getTimezoneFromCoordinates(lat, lon);

  // Transform forecast data
  const transformedForecast = transformDailyForecast(forecast, hourly, lat, lon);

  return {
    id: cityName.toLowerCase().replace(/\s+/g, '_'),
    name: cityName,
    country,
    latitude,
    longitude,
    timezone,
    forecast: transformedForecast,
  };
}

/**
 * Get location info for display
 */
export function getLocationInfo(cityData: CityData, fetchTime: Date = new Date()) {
  return {
    cityName: cityData.name,
    country: cityData.country,
    latitude: cityData.latitude,
    longitude: cityData.longitude,
    timezone: cityData.timezone,
    lastUpdated: getRelativeTime(fetchTime),
  };
}

/**
 * Reverse geocode coordinates to get country (simplified)
 * In production, use a proper reverse geocoding service
 */
export function getCountryFromCoordinates(lat: number, lon: number): string {
  // Simplified country detection based on coordinates
  // In production, use a proper geocoding API like Google Maps or OpenStreetMap

  // Major countries/regions
  if (lat > 25 && lat < 35 && lon > 68 && lon < 97) return 'India';
  if (lat > 39 && lat < 49 && lon > -125 && lon < -66) return 'United States';
  if (lat > 41 && lat < 51 && lon > -8 && lon < 2) return 'United Kingdom';
  if (lat > 43 && lat < 51 && lon > 2 && lon < 8) return 'France';
  if (lat > 47 && lat < 55 && lon > 5 && lon < 16) return 'Germany';
  if (lat > 35 && lat < 42 && lon > 12 && lon < 19) return 'Italy';
  if (lat > 30 && lat < 42 && lon > -10 && lon < 4) return 'Spain';
  if (lat > 35 && lat < 42 && lon > 20 && lon < 30) return 'Egypt';
  if (lat > 34 && lat < 42 && lon > 139 && lon < 145) return 'Japan';
  if (lat > 1 && lat < 7 && lon > 103 && lon < 105) return 'Singapore';
  if (lat > -34 && lat < -33 && lon > 151 && lon < 152) return 'Australia';

  return 'Unknown';
}
