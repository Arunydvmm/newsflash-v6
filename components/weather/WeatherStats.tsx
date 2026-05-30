'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Wind, Sun, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';
import { DayForecast } from '@/lib/weatherTypes';

interface WeatherStatsProps {
  day: DayForecast;
}

export default function WeatherStats({ day }: WeatherStatsProps) {
  const getCompassAngle = (dir: string) => {
    const directions: Record<string, number> = {
      N: 0,
      NNE: 22.5,
      NE: 45,
      ENE: 67.5,
      E: 90,
      ESE: 112.5,
      SE: 135,
      SSE: 157.5,
      S: 180,
      SSW: 202.5,
      SW: 225,
      WSW: 247.5,
      W: 270,
      WNW: 292.5,
      NW: 315,
      NNW: 337.5,
    };
    return directions[dir] || 0;
  };

  const angle = getCompassAngle(day.windDirection);

  const StatCard = ({ icon: Icon, label, value, unit, progress }: any) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-600">{unit}</span>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-2">
          <div className="bg-blue-600 h-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={Droplets}
        label="Humidity"
        value={day.humidity}
        unit="%"
        progress={day.humidity}
      />
      <StatCard
        icon={Wind}
        label="Wind Speed"
        value={day.windSpeed}
        unit="km/h"
      />
      <StatCard
        icon={Gauge}
        label="Pressure"
        value={day.pressureValue}
        unit="mb"
      />
      <StatCard
        icon={Eye}
        label="Visibility"
        value={day.visibility}
        unit="km"
      />
      <StatCard
        icon={Sun}
        label="UV Index"
        value={day.uvIndex}
        unit={day.uvLevel}
      />
      <StatCard
        icon={Sunrise}
        label="Sunrise"
        value={day.sunriseTime}
        unit=""
      />
      <StatCard
        icon={Sunset}
        label="Sunset"
        value={day.sunsetTime}
        unit=""
      />
      <StatCard
        icon={Wind}
        label="Wind Direction"
        value={day.windDirection}
        unit=""
      />
    </div>
  );
}
