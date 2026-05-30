'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Droplets, Snowflake } from 'lucide-react';
import { DayForecast } from '@/lib/weatherTypes';
import { WeatherIcon } from './WeatherIcon';

interface ForecastGridProps {
  forecast: DayForecast[];
  selectedDayIndex: number;
  setSelectedDayIndex: (index: number) => void;
}

export default function ForecastGrid({
  forecast,
  selectedDayIndex,
  setSelectedDayIndex,
}: ForecastGridProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          5-Day Forecast
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.slice(0, 5).map((day, index) => {
          const isSelected = selectedDayIndex === index;
          const isSnowy = day.iconName === 'snowy';

          return (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelectedDayIndex(index)}
              className={`rounded-lg p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                  : 'bg-white text-gray-900 shadow-md hover:shadow-lg border border-gray-200'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {day.dayShort}
              </span>

              {/* Weather icon */}
              <div className="my-1 scale-90">
                <WeatherIcon name={day.iconName} className="w-12 h-12" />
              </div>

              {/* Temperature */}
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">
                  {day.tempMax}°
                </span>
                <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                  {day.tempMin}°
                </span>
              </div>

              {/* Precipitation */}
              <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${
                isSelected ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {isSnowy ? (
                  <Snowflake className="w-3 h-3" />
                ) : (
                  <Droplets className="w-3 h-3" />
                )}
                <span>{day.pop}%</span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <span className="absolute bottom-2 w-2 h-2 bg-yellow-300 rounded-full"></span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
