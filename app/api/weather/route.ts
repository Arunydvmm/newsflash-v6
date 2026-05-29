// @ts-nocheck
// AccuWeather API integration with fallback
import { NextRequest, NextResponse } from 'next/server'

const ACCUWEATHER_API_KEY = process.env.ACCUWEATHER_API_KEY
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

let cache: Record<string, { data: any; ts: number }> = {}

// Mock weather data for fallback - realistic data based on location
const getMockWeatherData = (locationName: string, lat: number = 20.5937, lon: number = 78.9629) => {
  // Realistic temperature based on location
  let baseTemp = 25;
  let condition = 'Partly Cloudy';
  let icon = 2;
  
  // Temperature ranges by latitude
  if (lat > 30) {
    baseTemp = 18; // Northern regions - cooler
  } else if (lat > 20) {
    baseTemp = 25; // Central regions
  } else if (lat > 10) {
    baseTemp = 28; // Southern regions - warmer
  } else {
    baseTemp = 30; // Tropical regions
  }
  
  // Ensure temperature is never 0 or unrealistic
  if (baseTemp <= 0 || baseTemp > 50) {
    baseTemp = 25;
  }
  
  return {
    location: locationName || 'Your Location',
    lat,
    lon,
    current: {
      temperature: baseTemp,
      condition,
      icon,
      humidity: 65,
      windSpeed: 12,
      windDirection: 'NE',
      uvIndex: 5,
      visibility: 10,
      dewPoint: 15,
      feelsLike: baseTemp + 1,
      pressure: 1013,
      windGust: 18,
    },
    forecast: [
      { date: new Date().toISOString(), high: baseTemp + 3, low: baseTemp - 5, condition: 'Sunny', icon: 1, precipitation: 0, precipitationProbability: 0, wind: 10 },
      { date: new Date(Date.now() + 86400000).toISOString(), high: baseTemp + 2, low: baseTemp - 6, condition: 'Partly Cloudy', icon: 2, precipitation: 0, precipitationProbability: 10, wind: 12 },
      { date: new Date(Date.now() + 172800000).toISOString(), high: baseTemp + 1, low: baseTemp - 7, condition: 'Cloudy', icon: 3, precipitation: 2, precipitationProbability: 20, wind: 14 },
      { date: new Date(Date.now() + 259200000).toISOString(), high: baseTemp, low: baseTemp - 8, condition: 'Rainy', icon: 5, precipitation: 5, precipitationProbability: 60, wind: 16 },
      { date: new Date(Date.now() + 345600000).toISOString(), high: baseTemp + 1, low: baseTemp - 7, condition: 'Partly Cloudy', icon: 2, precipitation: 1, precipitationProbability: 15, wind: 11 },
    ],
    hourly: Array.from({ length: 12 }, (_, i) => {
      const hourTemp = Math.max(baseTemp - 5, baseTemp - i * 0.5); // Ensure temp doesn't go too low
      return {
        time: new Date(Date.now() + i * 3600000).toISOString(),
        temperature: hourTemp,
        condition: 'Partly Cloudy',
        icon: 2,
        precipitation: 0,
        humidity: 65 + i * 2,
      };
    }),
  }
}

async function getLocationKey(lat: number, lon: number) {
  try {
    // Try using the geoposition endpoint which is more reliable
    const url = `https://dataservice.accuweather.com/locations/v1/currentlocation?apikey=${ACCUWEATHER_API_KEY}&q=${lat},${lon}&details=true`
    console.log('Fetching location key from:', url.replace(ACCUWEATHER_API_KEY, 'API_KEY'))
    
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error('Location API response not ok:', res.status, res.statusText)
      // Try alternative endpoint
      return await getLocationKeyAlternative(lat, lon)
    }
    
    const data = await res.json()
    console.log('Location data:', data)
    
    if (!data || !data.Key) {
      console.error('No Key in location response:', data)
      // Try alternative endpoint
      return await getLocationKeyAlternative(lat, lon)
    }
    
    return data.Key
  } catch (err) {
    console.error('AccuWeather location error:', err)
    // Try alternative endpoint
    return await getLocationKeyAlternative(lat, lon)
  }
}

async function getLocationKeyAlternative(lat: number, lon: number) {
  try {
    // Use the geoposition endpoint as alternative
    const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${ACCUWEATHER_API_KEY}&q=${lat},${lon}&details=true`
    console.log('Trying alternative location endpoint')
    
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error('Alternative location API response not ok:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    console.log('Alternative location data:', data)
    
    if (!data || !data.Key) {
      console.error('No Key in alternative location response:', data)
      return null
    }
    
    return data.Key
  } catch (err) {
    console.error('AccuWeather alternative location error:', err)
    return null
  }
}

async function getCurrentWeather(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true&aqi=true`
    console.log('Fetching current weather from:', url)
    
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error('Current weather API response not ok:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    console.log('Current weather data:', data)
    
    if (!data || !data[0]) {
      console.error('No weather data in response:', data)
      return null
    }
    
    return data[0]
  } catch (err) {
    console.error('AccuWeather current weather error:', err)
    return null
  }
}

async function getForecast(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true&metric=true`
    console.log('Fetching forecast from:', url)
    
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error('Forecast API response not ok:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    console.log('Forecast data:', data)
    
    return data.DailyForecasts || []
  } catch (err) {
    console.error('AccuWeather forecast error:', err)
    return null
  }
}

async function getHourlyForecast(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true&metric=true`
    console.log('Fetching hourly forecast from:', url)
    
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error('Hourly forecast API response not ok:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    console.log('Hourly forecast data:', data)
    
    return data || []
  } catch (err) {
    console.error('AccuWeather hourly forecast error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const { lat, lon, locationName } = await req.json()

  if (!ACCUWEATHER_API_KEY) {
    console.warn('AccuWeather API key not configured, using mock data')
    return NextResponse.json(
      { ...getMockWeatherData(locationName), mock: true },
      { status: 200 }
    )
  }

  const cacheKey = `weather-${lat}-${lon}`

  // Check cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    console.log('Returning cached weather data')
    return NextResponse.json(
      { ...cache[cacheKey].data, cached: true },
      { headers: { 'X-Cache': 'HIT' } }
    )
  }

  try {
    // Get location key
    const locationKey = await getLocationKey(lat, lon)
    if (!locationKey) {
      console.warn('Could not get location key, using mock data')
      const mockData = getMockWeatherData(locationName, lat, lon)
      cache[cacheKey] = { data: mockData, ts: Date.now() }
      return NextResponse.json(
        { ...mockData, mock: true },
        { status: 200 }
      )
    }

    // Get current weather
    const current = await getCurrentWeather(locationKey)
    if (!current) {
      console.warn('Could not get current weather, using mock data')
      const mockData = getMockWeatherData(locationName, lat, lon)
      cache[cacheKey] = { data: mockData, ts: Date.now() }
      return NextResponse.json(
        { ...mockData, mock: true },
        { status: 200 }
      )
    }

    // Get forecast and hourly
    const forecast = await getForecast(locationKey)
    const hourly = await getHourlyForecast(locationKey)

    // Ensure we have valid temperature data
    const currentTemp = current.Temperature?.Metric?.Value
    const hasValidTemp = currentTemp !== null && currentTemp !== undefined && currentTemp !== 0

    if (!hasValidTemp || !forecast || forecast.length === 0) {
      console.warn('Invalid or missing weather data, using mock data')
      const mockData = getMockWeatherData(locationName, lat, lon)
      cache[cacheKey] = { data: mockData, ts: Date.now() }
      return NextResponse.json(
        { ...mockData, mock: true },
        { status: 200 }
      )
    }

    const weatherData = {
      location: locationName || 'Your Location',
      lat,
      lon,
      current: {
        temperature: Math.round(currentTemp),
        condition: current.WeatherText || 'Unknown',
        icon: current.WeatherIcon || 1,
        humidity: current.RelativeHumidity || 0,
        windSpeed: Math.round(current.Wind?.Speed?.Metric?.Value || 0),
        windDirection: current.Wind?.Direction?.Localized || 'N/A',
        uvIndex: current.UVIndex || 0,
        visibility: Math.round(current.Visibility?.Metric?.Value || 0),
        dewPoint: Math.round(current.DewPoint?.Metric?.Value || 0),
        feelsLike: Math.round(current.ApparentTemperature?.Metric?.Value || currentTemp),
        pressure: Math.round(current.Pressure?.Metric?.Value || 0),
        windGust: Math.round(current.WindGustSpeed?.Metric?.Value || 0),
      },
      forecast: (forecast || []).slice(0, 5).map((day: any) => ({
        date: day.Date,
        high: Math.round(day.Temperature?.Maximum?.Value || 0),
        low: Math.round(day.Temperature?.Minimum?.Value || 0),
        condition: day.Day?.IconPhrase || 'Unknown',
        icon: day.Day?.Icon || 1,
        precipitation: Math.round(day.TotalLiquid?.Value || 0),
        precipitationProbability: day.Day?.PrecipitationProbability || 0,
        wind: Math.round(day.Day?.Wind?.Speed?.Metric?.Value || 0),
      })),
      hourly: (hourly || []).slice(0, 12).map((hour: any) => ({
        time: hour.DateTime,
        temperature: Math.round(hour.Temperature?.Metric?.Value || 0),
        condition: hour.IconPhrase || 'Unknown',
        icon: hour.WeatherIcon || 1,
        precipitation: Math.round(hour.TotalLiquid?.Value || 0),
        humidity: hour.RelativeHumidity || 0,
      })),
    }

    // Cache result
    cache[cacheKey] = { data: weatherData, ts: Date.now() }

    return NextResponse.json(
      { ...weatherData, cached: false },
      { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=1800' } }
    )
  } catch (err: any) {
    console.error('Weather API error:', err.message)
    // Return mock data on error
    const mockData = getMockWeatherData(locationName, lat, lon)
    cache[cacheKey] = { data: mockData, ts: Date.now() }
    return NextResponse.json(
      { ...mockData, mock: true, error: err.message },
      { status: 200 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get location from IP
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json(
        { lat: 20.5937, lon: 78.9629, city: 'India' },
        { status: 200 }
      )
    }
    
    const data = await res.json()
    return NextResponse.json({
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_name,
      region: data.region,
    })
  } catch (err: any) {
    console.error('IP location error:', err.message)
    return NextResponse.json(
      { lat: 20.5937, lon: 78.9629, city: 'India' },
      { status: 200 }
    )
  }
}
