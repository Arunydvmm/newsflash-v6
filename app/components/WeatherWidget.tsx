'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'

const WEATHER_ICONS: Record<number, string> = {
  1: '☀️', 2: '⛅', 3: '☁️', 4: '☁️', 5: '🌧️', 6: '🌧️', 7: '⛈️', 8: '❄️',
  11: '🌫️', 12: '🌧️', 13: '❄️', 14: '❄️', 15: '⛈️', 16: '❄️', 17: '⛈️',
  18: '🌧️', 19: '❄️', 20: '❄️', 21: '❄️', 22: '❄️', 23: '❄️', 24: '❄️',
  25: '❄️', 26: '❄️', 29: '❄️', 30: '🌡️', 31: '❄️', 32: '🌬️', 33: '🌙',
  34: '🌙', 35: '🌙', 36: '🌙', 37: '⛈️', 38: '⛈️', 39: '🌧️', 40: '🌧️',
  41: '❄️', 42: '❄️', 43: '❄️', 44: '❄️',
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeather(latitude, longitude)
        },
        (err) => {
          console.error('Geolocation error:', err)
          // Fallback to default location (India)
          fetchWeather(20.5937, 78.9629, 'India')
        }
      )
    } else {
      // Fallback to default location
      fetchWeather(20.5937, 78.9629, 'India')
    }
  }, [])

  const fetchWeather = async (lat: number, lon: number, locationName?: string) => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, locationName }),
      })

      if (!res.ok) {
        setError('Failed to load weather')
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
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: 'white', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
        ⏳ Loading weather...
      </div>
    )
  }

  if (error || !weather) {
    return null
  }

  const { current, forecast, location } = weather
  const icon = WEATHER_ICONS[current.icon] || '🌤️'

  return (
    <div style={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 16px rgba(21,101,192,0.3)' }}>
      {/* Main Weather Display */}
      <div style={{ padding: '20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>
              📍 {location}
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 900, marginBottom: 4 }}>
              {Math.round(current.temperature)}°C
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {current.condition}
            </div>
          </div>
          <div style={{ fontSize: 56, textAlign: 'center' }}>
            {icon}
          </div>
        </div>

        {/* Current Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: 0.7, marginBottom: 4 }}>Feels Like</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{Math.round(current.feelsLike)}°C</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: 0.7, marginBottom: 4 }}>Humidity</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{current.humidity}%</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: 0.7, marginBottom: 4 }}>Wind</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{Math.round(current.windSpeed)} km/h</div>
          </div>
        </div>

        {/* Toggle Forecast */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            width: '100%',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          {expanded ? '▼ Hide Forecast' : '▶ 5-Day Forecast'}
        </button>
      </div>

      {/* Forecast Section */}
      {expanded && forecast && forecast.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
            {forecast.map((day: any, i: number) => {
              const date = new Date(day.date)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayIcon = WEATHER_ICONS[day.icon] || '🌤️'
              
              return (
                <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginBottom: 6, opacity: 0.8 }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>
                    {dayIcon}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    {Math.round(day.high)}° / {Math.round(day.low)}°
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: 0.7 }}>
                    {day.condition}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
        Powered by AccuWeather
      </div>
    </div>
  )
}
