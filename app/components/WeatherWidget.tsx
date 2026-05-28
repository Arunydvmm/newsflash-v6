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
  const [location, setLocation] = useState('Your Location')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeatherWithLocation(latitude, longitude)
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
        setLocation(ipLocation.city || 'Your Location')
        fetchWeatherWithLocation(ipLocation.lat, ipLocation.lon, ipLocation.city)
      } else {
        fetchWeatherWithLocation(20.5937, 78.9629, 'India')
      }
    } catch (err) {
      console.error('IP location error:', err)
      fetchWeatherWithLocation(20.5937, 78.9629, 'India')
    }
  }

  const fetchWeatherWithLocation = async (lat: number, lon: number, locationName?: string) => {
    if (locationName) setLocation(locationName)
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
      <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleWeatherClick}>
        <div style={{ fontSize: 20 }}>⏳</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginTop: 4 }}>Loading...</div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleWeatherClick}>
        <div style={{ fontSize: 20 }}>⚠️</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', marginTop: 4 }}>Weather</div>
      </div>
    )
  }

  const { current } = weather
  const icon = WEATHER_ICONS[current.icon] || '🌤️'

  return (
    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleWeatherClick}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666', lineHeight: 1.3 }}>
        <div>{Math.round(current.temperature)}°C</div>
        <div style={{ fontSize: 9, opacity: 0.8 }}>{current.condition}</div>
        <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>{location}</div>
      </div>
    </div>
  )
}
