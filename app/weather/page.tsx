'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { transformAccuWeatherData, getLocationInfo, getCountryFromCoordinates } from '@/lib/weatherDataTransformer';
import { CityData, DayForecast } from '@/lib/weatherTypes';
import CurrentWeather from '@/components/weather/CurrentWeather';
import WeatherStats from '@/components/weather/WeatherStats';
import ForecastGrid from '@/components/weather/ForecastGrid';
import HourlyTrend from '@/components/weather/HourlyTrend';

export default function WeatherPage() {
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      setError('');

      let latitude = lat;
      let longitude = lon;

      // Get coordinates from geolocation if not provided
      if (latitude === undefined || longitude === undefined) {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos.coords),
              (err) => reject(err)
            );
          });
          latitude = position.latitude;
          longitude = position.longitude;
        } else {
          // Fallback to IP-based location
          const ipRes = await fetch('/api/weather');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            latitude = ipData.lat;
            longitude = ipData.lon;
          } else {
            throw new Error('Unable to determine location');
          }
        }
      }

      // Fetch weather data from API
      const weatherRes = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          locationName: 'Your Location',
        }),
      });

      if (!weatherRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherRes.json();

      // Get country from coordinates
      const country = getCountryFromCoordinates(latitude, longitude);

      // Transform data to aethercast format
      const transformed = transformAccuWeatherData(
        weatherData,
        weatherData.location || 'Your Location',
        country
      );

      setCityData(transformed);
      setSelectedDayIndex(0);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to load weather data. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Weather Data</h1>
          <p className="text-gray-600">Getting your location and weather information...</p>
        </div>
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Weather</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchWeatherData()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeDay = cityData.forecast[selectedDayIndex] || cityData.forecast[0];
  const isToday = selectedDayIndex === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            NEWS<span className="text-red-600">FLASH</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                📍 {cityData.name}, {cityData.country}
              </div>
              <div className="text-xs text-gray-600">
                {cityData.latitude} | {cityData.longitude}
              </div>
              <div className="text-xs text-gray-600">
                {cityData.timezone} • Updated {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Current Weather Card */}
        <div className="mb-8">
          <CurrentWeather city={cityData} day={activeDay} isToday={isToday} />
        </div>

        {/* Weather Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Weather Details</h2>
          <WeatherStats day={activeDay} />
        </div>

        {/* Hourly Forecast */}
        {activeDay.hourly && activeDay.hourly.length > 0 && (
          <div className="mb-8">
            <HourlyTrend day={activeDay} />
          </div>
        )}

        {/* 5-Day Forecast */}
        <div className="mb-8">
          <ForecastGrid
            forecast={cityData.forecast}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 font-semibold">Sunrise</div>
              <div className="text-lg font-bold text-gray-900">{activeDay.sunriseTime}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Sunset</div>
              <div className="text-lg font-bold text-gray-900">{activeDay.sunsetTime}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Pressure Trend</div>
              <div className="text-lg font-bold text-gray-900">{activeDay.pressureTrend}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">AQI Level</div>
              <div className="text-lg font-bold text-gray-900">{activeDay.aqiLevel}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>Weather data provided by AccuWeather API</p>
          <p className="text-gray-400 mt-2">© 2026 Newsflash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
