'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'

const WEATHER_ICONS: Record<number, string> = {
  1: '☀️', 2: '⛅', 3: '☁️', 4: '☁️', 5: '🌧️', 6: '🌧️', 7: '⛈️', 8: '❄️',
  11: '🌫️', 12: '🌧️', 13: '❄️', 14: '❄️', 15: '⛈️', 16: '❄️', 17: '⛈️',
  18: '🌧️', 19: '❄️', 20: '❄️', 21: '❄️', 22: '❄️', 23: '❄️', 24: '❄️',
  25: '❄️', 26: '❄️', 29: '❄️', 30: '🌡️', 31: '❄️', 32: '🌬️', 33: '🌙',
  34: '🌙', 35: '🌙', 36: '🌙', 37: '⛈️', 38: '⛈️', 39: '🌧️', 40: '🌧️',
  41: '❄️', 42: '❄️', 43: '❄️', 44: '❄️',
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          // Try to get city name from IP location
          try {
            const geoRes = await fetch('/api/weather')
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              fetchWeather(latitude, longitude, geoData.city || 'Your Location')
            } else {
              fetchWeather(latitude, longitude)
            }
          } catch (e) {
            fetchWeather(latitude, longitude)
          }
        },
        (err) => {
          console.error('Geolocation error:', err)
          fetchIPLocation()
        }
      )
    } else {
      fetchIPLocation()
    }
  }, [])

  const fetchIPLocation = async () => {
    try {
      const res = await fetch('/api/weather')
      if (res.ok) {
        const ipLocation = await res.json()
        const cityName = ipLocation.city || ipLocation.region || 'Your Location'
        fetchWeather(ipLocation.lat, ipLocation.lon, cityName)
      } else {
        fetchWeather(20.5937, 78.9629, 'Your Location')
      }
    } catch (err) {
      console.error('IP location error:', err)
      fetchWeather(20.5937, 78.9629, 'Your Location')
    }
  }

  const fetchWeather = async (lat: number, lon: number, locationName?: string) => {
    try {
      setLoading(true)
      setError('')
      
      // If no locationName provided, try to get it from reverse geocoding or use default
      let finalLocationName = locationName
      if (!finalLocationName) {
        try {
          const geoRes = await fetch('/api/weather')
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            finalLocationName = geoData.city || 'Your Location'
          }
        } catch (e) {
          finalLocationName = 'Your Location'
        }
      }
      
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, locationName: finalLocationName }),
      })

      if (!res.ok) {
        setError('Failed to load weather data')
        setLoading(false)
        return
      }

      const data = await res.json()
      setWeather(data)
      setLoading(false)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#0D1B2A', marginBottom: 8 }}>Loading Weather Data</div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#0D1B2A', marginBottom: 8 }}>Unable to Load Weather</div>
          <Link href="/" style={{ background: '#C62828', color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-block', marginTop: 20 }}>← Back to Home</Link>
        </div>
      </div>
    )
  }

  const { current, forecast, hourly, location, lat, lon } = weather
  const icon = WEATHER_ICONS[current.icon] || '🌤️'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '2px solid #0D1B2A', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <Link href="/" className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, color: '#0D1B2A', textDecoration: 'none', letterSpacing: -1, display: 'flex', alignItems: 'baseline', gap: 0, flexShrink: 0 }}>
            NEWS<span style={{ color: '#C62828' }}>FLASH</span>
          </Link>
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#666', textDecoration: 'none', padding: '8px 16px', borderRadius: 6, border: '1px solid #E5E7EB' }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Current Weather Card */}
        <div style={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', borderRadius: 16, padding: 'clamp(16px, 5vw, 32px)', color: 'white', marginBottom: 32, boxShadow: '0 8px 32px rgba(21,101,192,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'clamp(1fr, 100%, 1fr 1fr)', gap: 'clamp(16px, 4vw, 32px)', alignItems: 'center' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(10px, 2vw, 12px)', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>
                📍 Current Location
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, marginBottom: 8, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {location}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(9px, 1.5vw, 11px)', opacity: 0.7, marginBottom: 16, wordBreak: 'break-word' }}>
                Lat: {lat.toFixed(4)}° | Lon: {lon.toFixed(4)}°
              </div>
              <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', opacity: 0.9, marginBottom: 16, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {current.condition}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(60px, 12vw, 96px)', marginBottom: 16 }}>
                {icon}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 10vw, 64px)', fontWeight: 900 }}>
                {Math.round(current.temperature)}°C
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(10px, 2vw, 12px)', opacity: 0.8, marginTop: 8 }}>
                Feels like {Math.round(current.feelsLike)}°C
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg,#1565C0,#0D47A1)', borderRadius: 2 }} />
            Detailed Metrics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 40vw, 200px), 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
            {[
              { label: 'Temperature', value: `${Math.round(current.temperature)}°C`, icon: '🌡️' },
              { label: 'Feels Like', value: `${Math.round(current.feelsLike)}°C`, icon: '🤔' },
              { label: 'Humidity', value: `${current.humidity}%`, icon: '💧' },
              { label: 'Wind Speed', value: `${Math.round(current.windSpeed)} km/h`, icon: '💨' },
              { label: 'Wind Direction', value: current.windDirection, icon: '🧭' },
              { label: 'Wind Gust', value: `${Math.round(current.windGust)} km/h`, icon: '🌪️' },
              { label: 'Pressure', value: `${Math.round(current.pressure)} mb`, icon: '🔽' },
              { label: 'Dew Point', value: `${Math.round(current.dewPoint)}°C`, icon: '❄️' },
              { label: 'Visibility', value: `${Math.round(current.visibility)} km`, icon: '👁️' },
              { label: 'UV Index', value: current.uvIndex, icon: '☀️' },
            ].map((metric, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: 'clamp(12px, 3vw, 16px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>{metric.icon}</span>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(9px, 2vw, 11px)', color: '#666', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {metric.label}
                  </div>
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, color: '#0D1B2A' }}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Forecast */}
        {hourly && hourly.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg,#F57C00,#E65100)', borderRadius: 2 }} />
              12-Hour Forecast
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {hourly.map((hour: any, i: number) => {
                const time = new Date(hour.time)
                const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                const hourIcon = WEATHER_ICONS[hour.icon] || '🌤️'
                
                return (
                  <div key={i} style={{ background: 'white', borderRadius: 12, padding: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', textAlign: 'center', minWidth: 120 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginBottom: 6, fontWeight: 600 }}>
                      {timeStr}
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>
                      {hourIcon}
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0D1B2A', marginBottom: 4 }}>
                      {Math.round(hour.temperature)}°C
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#999', marginBottom: 4 }}>
                      {hour.condition}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#666' }}>
                      💧 {hour.humidity}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast && forecast.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0D1B2A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg,#1B5E20,#2E7D32)', borderRadius: 2 }} />
              5-Day Forecast
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {forecast.map((day: any, i: number) => {
                const date = new Date(day.date)
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const dayIcon = WEATHER_ICONS[day.icon] || '🌤️'
                
                return (
                  <div key={i} style={{ background: 'white', borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginBottom: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {dayName}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#999', marginBottom: 12 }}>
                      {dateStr}
                    </div>
                    <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>
                      {dayIcon}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
                      <div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#999', marginBottom: 4 }}>High</div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#C62828' }}>
                          {Math.round(day.high)}°
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#999', marginBottom: 4 }}>Low</div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#1565C0' }}>
                          {Math.round(day.low)}°
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginBottom: 8 }}>
                      {day.condition}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                      <div style={{ background: '#F0F0EC', padding: '6px 8px', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#666', marginBottom: 2 }}>Precipitation</div>
                        <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{Math.round(day.precipitation)} mm</div>
                      </div>
                      <div style={{ background: '#F0F0EC', padding: '6px 8px', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#666', marginBottom: 2 }}>Wind</div>
                        <div style={{ fontWeight: 600, color: '#0D1B2A' }}>{Math.round(day.wind)} km/h</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
