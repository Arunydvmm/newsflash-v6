'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, CloudLightning } from 'lucide-react';

interface WeatherIconProps {
  name: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy' | 'stormy';
  className?: string;
}

export function WeatherIcon({ name, className = 'w-20 h-20' }: WeatherIconProps) {
  const containerVariants = {
    hover: { scale: 1.05 },
  };

  const sunVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 25, repeat: Infinity, ease: 'linear' as const },
    },
  };

  const rainBreakVariants = {
    animate: {
      y: [0, 4, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  const cloudVariants = {
    animate: {
      x: [-2, 2, -2],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  switch (name) {
    case 'sunny':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative">
          <motion.div variants={sunVariants} animate="animate">
            <Sun className={`${className} text-amber-400 stroke-[1.25] drop-shadow-[0_0_15px_rgba(251,192,45,0.4)]`} />
          </motion.div>
        </motion.div>
      );
    case 'cloudy':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative">
          <motion.div variants={cloudVariants} animate="animate">
            <Cloud className={`${className} text-sky-200 stroke-[1.25] drop-shadow-[0_0_12px_rgba(224,242,254,0.3)]`} />
          </motion.div>
        </motion.div>
      );
    case 'rainy':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative">
          <motion.div variants={rainBreakVariants} animate="animate" className="flex">
            <CloudRain className={`${className} text-blue-300 stroke-[1.25] drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]`} />
          </motion.div>
        </motion.div>
      );
    case 'snowy':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative">
          <motion.div animate={{ y: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }} className="relative">
            <CloudSnow className={`${className} text-slate-100 stroke-[1.25] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]`} />
          </motion.div>
        </motion.div>
      );
    case 'partly_cloudy':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative flex items-center justify-center">
          <motion.div variants={sunVariants} animate="animate" className="absolute -top-1 -right-1">
            <Sun className="w-14 h-14 text-amber-400/80 stroke-[1] drop-shadow-[0_0_8px_rgba(251,192,45,0.2)]" />
          </motion.div>
          <motion.div variants={cloudVariants} animate="animate" className="relative">
            <CloudSun className={`${className} text-slate-200 stroke-[1.25] drop-shadow-[0_0_12px_rgba(186,230,253,0.2)]`} />
          </motion.div>
        </motion.div>
      );
    case 'stormy':
      return (
        <motion.div variants={containerVariants} whileHover="hover" className="relative">
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="relative">
            <CloudLightning className={`${className} text-indigo-300 stroke-[1.25] drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]`} />
          </motion.div>
        </motion.div>
      );
    default:
      return <Cloud className={`${className} text-gray-300`} />;
  }
}
