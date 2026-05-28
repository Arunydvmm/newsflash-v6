'use client'
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const WEATHER_ICONS: Record<number, string> = {
  1: '☀️', 2: '⛅', 3: '☁️', 4: '☁️', 5: '🌧️', 6: '🌧️', 7: '⛈️', 8: '❄️',
  11: '🌫️', 12: '🌧️', 13: '❄️', 14: '❄️', 15: '⛈️', 16: '❄️', 17: '⛈️',
  18: '🌧️', 19: '❄️', 20: '❄️', 21: '❄️', 22: '❄️', 23: '❄️', 24: '❄️',
  25: '❄️', 26: '❄️', 29: '❄️', 30: '🌡️', 31: '❄️', 32: '🌬️', 33: '🌙',
  34: '🌙', 35: '🌙', 36: '🌙', 37: '⛈️', 38: '⛈️', 39: '🌧️', 40: '🌧️',
  41: '❄️', 42: '❄️', 43: '❄️', 44: '❄️',
}

export default function WeatherWidget() {
  const router = useRouter()
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
          // Fallback to IP-based location
          fetchIPLocation()
        }
      )
    } else {
      // Fallback to IP-based location
      fetchIPLocation()
    }
  }, [])

  const fetchIPLocation = async () => {
    try {
      const res = await fetch('/api/weather')
      if (res.ok) {
        const ipLocation = await res.json()
        fetchWeather(ipLocation.lat, ipLocation.lon, ipLocation.city)
      } else {
        fetchWeather(20.5937, 78.9629, 'India')
      }
    } catch (err) {
      console.error('IP location error:', err)
      fetchWeather(20.5937, 78.9629, 'India')
    }
  }

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
        const errorData = await res.json()
        console.error('Weather API error:', errorData)
        setError('Failed to load weather')
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data && data.current) {
        setWeather(data)
        setError('')
      } else {
        setError('Invalid weather data')
      }
      setLoading(false)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
      setLoading(false)
    }
  }

  const handleWeatherClick = () => {
    router.push('/weather')
  }

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', borderRadius: 12, padding: '20px', marginBottom: 20, color: 'white', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(21,101,192,0.3)' }}>
        <div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div>Loading weather...</div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div style={{ background: 'linear-gradient(135deg,#1565C0,#0D47A1)', borderRadius: 12, padding: '20px', marginBottom: 20, color: 'white', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(21,101,192,0.3)', cursor: 'pointer' }} onClick={handleWeatherClick}>
        <div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div>{error || 'Weather unavailable'}</div>
          <div style={{ fontSize: 10, marginTop: 8, opacity: 0.8 }}>Click to retry</div>
        </div>
      </div>
    )
  }

  const { current, forecast, location } = weather
  const icon = WEATHER_ICONS[current.icon] || '🌤️'

  return (
    <div 
      onClick={handleWeatherClick}
      style={{ 
        background: 'linear-gradient(135deg,#1565C0,#0D47A1)', 
        borderRadius: 12, 
        overflow: 'hidden', 
        marginBottom: 20, 
        boxShadow: '0 4px 16px rgba(21,101,192,0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }} 
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(21,101,192,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(21,101,192,0.3)'
      }}
    >
      {/* Main Weather Display */}
      <div style={{ padding: '16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8, marginBottom: 4 }}>
              📍 {location}
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900, marginBottom: 2 }}>
              {Math.round(current.temperature)}°C
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {current.condition}
            </div>
          </div>
          <div style={{ fontSize: 48, textAlign: 'center' }}>
            {icon}
          </div>
        </div>

        {/* Current Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: 0.7, marginBottom: 3 }}>Feels Like</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(current.feelsLike)}°C</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: 0.7, marginBottom: 3 }}>Humidity</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{current.humidity}%</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: 0.7, marginBottom: 3 }}>Wind</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{Math.round(current.windSpeed)} km/h</div>
          </div>
        </div>

        {/* Toggle Forecast */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            width: '100%',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          {expanded ? '▼ Hide Forecast' : '▶ 5-Day Forecast'} · Click for Details
        </button>
      </div>

      {/* Forecast Section */}
      {expanded && forecast && forecast.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
            {forecast.map((day: any, i: number) => {
              const date = new Date(day.date)
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayIcon = WEATHER_ICONS[day.icon] || '🌤️'
              
              return (
                <div key={i} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, marginBottom: 4, opacity: 0.8 }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {dayIcon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
                    {Math.round(day.high)}° / {Math.round(day.low)}°
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, opacity: 0.7 }}>
                    {day.condition}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 20px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>
        Powered by AccuWeather · Click to view detailed forecast
      </div>
    </div>
  )
}
