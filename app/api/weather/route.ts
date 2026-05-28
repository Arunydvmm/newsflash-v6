// @ts-nocheck
// AccuWeather API integration
import { NextRequest, NextResponse } from 'next/server'

const ACCUWEATHER_API_KEY = process.env.ACCUWEATHER_API_KEY
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

let cache: Record<string, { data: any; ts: number }> = {}

async function getLocationKey(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://dataservice.accuweather.com/locations/v1/currentlocation?apikey=${ACCUWEATHER_API_KEY}&q=${lat},${lon}&details=true`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null
    const data = await res.json()
    return data.Key
  } catch (err) {
    console.error('AccuWeather location error:', err)
    return null
  }
}

async function getCurrentWeather(locationKey: string) {
  try {
    const res = await fetch(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true&aqi=true`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null
    const data = await res.json()
    return data[0]
  } catch (err) {
    console.error('AccuWeather current weather error:', err)
    return null
  }
}

async function getForecast(locationKey: string) {
  try {
    const res = await fetch(
      `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true&metric=true`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null
    const data = await res.json()
    return data.DailyForecasts || []
  } catch (err) {
    console.error('AccuWeather forecast error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const { lat, lon, locationName } = await req.json()

  if (!ACCUWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'AccuWeather API key not configured' },
      { status: 503 }
    )
  }

  const cacheKey = `weather-${lat}-${lon}`

  // Check cache
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return NextResponse.json(
      { ...cache[cacheKey].data, cached: true },
      { headers: { 'X-Cache': 'HIT' } }
    )
  }

  try {
    // Get location key
    const locationKey = await getLocationKey(lat, lon)
    if (!locationKey) {
      return NextResponse.json(
        { error: 'Could not determine location' },
        { status: 400 }
      )
    }

    // Get current weather
    const current = await getCurrentWeather(locationKey)
    if (!current) {
      return NextResponse.json(
        { error: 'Could not fetch weather data' },
        { status: 400 }
      )
    }

    // Get forecast
    const forecast = await getForecast(locationKey)

    const weatherData = {
      location: locationName || 'Your Location',
      current: {
        temperature: current.Temperature?.Metric?.Value || 0,
        condition: current.WeatherText || 'Unknown',
        icon: current.WeatherIcon || 1,
        humidity: current.RelativeHumidity || 0,
        windSpeed: current.Wind?.Speed?.Metric?.Value || 0,
        windDirection: current.Wind?.Direction?.Localized || 'N/A',
        uvIndex: current.UVIndex || 0,
        visibility: current.Visibility?.Metric?.Value || 0,
        dewPoint: current.DewPoint?.Metric?.Value || 0,
        feelsLike: current.ApparentTemperature?.Metric?.Value || current.Temperature?.Metric?.Value || 0,
      },
      forecast: forecast.slice(0, 5).map((day: any) => ({
        date: day.Date,
        high: day.Temperature?.Maximum?.Value || 0,
        low: day.Temperature?.Minimum?.Value || 0,
        condition: day.Day?.IconPhrase || 'Unknown',
        icon: day.Day?.Icon || 1,
        precipitation: day.TotalLiquid?.Value || 0,
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
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
