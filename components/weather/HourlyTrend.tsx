'use client';

import React from 'react';
import { DayForecast } from '@/lib/weatherTypes';
import { WeatherIcon } from './WeatherIcon';

interface HourlyTrendProps {
  day: DayForecast;
}

export default function HourlyTrend({ day }: HourlyTrendProps) {
  if (!day.hourly || day.hourly.length === 0) {
    return null;
  }

  // Find min and max temps for scaling
  const temps = day.hourly.map(h => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Hourly Forecast</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {day.hourly.map((hour, index) => {
            const tempPercent = ((hour.temp - minTemp) / tempRange) * 100;

            return (
              <div key={index} className="flex flex-col items-center gap-2 min-w-[80px]">
                {/* Time */}
                <span className="text-xs font-bold text-gray-600">{hour.time}</span>

                {/* Temperature bar */}
                <div className="w-full h-24 bg-gray-100 rounded-lg relative flex items-end justify-center p-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded transition-all"
                    style={{ height: `${Math.max(20, tempPercent)}%` }}
                  ></div>
                </div>

                {/* Temperature value */}
                <span className="text-sm font-bold text-gray-900">{hour.temp}°</span>

                {/* Weather icon */}
                <div className="scale-75">
                  <WeatherIcon name={hour.condition} className="w-8 h-8" />
                </div>

                {/* Precipitation */}
                <span className="text-xs text-gray-600">{hour.pop}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
