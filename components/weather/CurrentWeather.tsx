'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import { CityData, DayForecast } from '@/lib/weatherTypes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  city: CityData;
  day: DayForecast;
  isToday: boolean;
}

export default function CurrentWeather({ city, day, isToday }: CurrentWeatherProps) {
  const displayTemp = isToday ? Math.round((day.tempMax + day.tempMin) / 2 + 1) : day.tempMax;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-lg">
      {/* Dynamic backdrop bloom */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-tr from-blue-400/10 to-blue-300/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

      {/* Left side summary details */}
      <div className="z-10 text-center md:text-left flex flex-col items-center md:items-start">
        {/* Location Header */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-yellow-300" />
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-blue-100">
              Current Location
            </div>
            <div className="text-2xl font-bold text-white">
              {city.name}, {city.country}
            </div>
            <div className="text-xs text-blue-100 mt-1">
              Lat: {city.latitude} | Lon: {city.longitude}
            </div>
            <div className="text-xs text-blue-100">
              Timezone: {city.timezone}
            </div>
          </div>
        </div>

        {/* Temperature Display */}
        <div className="flex items-baseline mt-4">
          <h1 className="text-7xl md:text-8xl font-bold text-white">
            {displayTemp}°
          </h1>
          <span className="text-3xl font-semibold ml-2 text-blue-100">C</span>
        </div>

        {/* Condition */}
        <div className="mt-4 text-center md:text-left">
          <div className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            {day.condition}
            <span className="text-xs font-normal border border-white/30 px-2 py-1 rounded bg-white/10 text-blue-100">
              {day.dayName}
            </span>
          </div>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            {day.description}
          </p>
        </div>
      </div>

      {/* Right side animated weather icon */}
      <div className="mt-8 md:mt-0 z-10 flex flex-col items-center">
        <WeatherIcon name={day.iconName} className="w-28 h-28 md:w-32 md:h-32" />

        {/* Temperature Range */}
        <div className="flex gap-3 mt-6">
          <div className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all border border-white/20">
            <ArrowUp className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-white font-medium">High: {day.tempMax}°</span>
          </div>
          <div className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 transition-all border border-white/20">
            <ArrowDown className="w-4 h-4 text-red-200" />
            <span className="text-sm text-white font-medium">Low: {day.tempMin}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
