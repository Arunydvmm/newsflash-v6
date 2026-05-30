import { NotificationService, WeatherChangeData } from './notificationService';
import { UserPreference } from './models/UserPreference';
import mongoose from 'mongoose';

interface WeatherSnapshot {
  userId: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
  timestamp: Date;
}

// Store last known weather state for comparison
const weatherCache = new Map<string, WeatherSnapshot>();

export class WeatherAlertTrigger {
  /**
   * Check weather for all users and trigger alerts if needed
   */
  static async checkWeatherAndTriggerAlerts(): Promise<void> {
    try {
      console.log('[WeatherAlertTrigger] Starting weather check...');

      // Get all users with notifications enabled
      const userPreferences = await UserPreference.find({
        notificationsEnabled: true,
      }).populate('userId');

      for (const preference of userPreferences) {
        try {
          await this.checkUserWeather(preference);
        } catch (error) {
          console.error(`[WeatherAlertTrigger] Error checking weather for user ${preference.userId}:`, error);
        }
      }

      console.log('[WeatherAlertTrigger] Weather check completed');
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error in checkWeatherAndTriggerAlerts:', error);
    }
  }

  /**
   * Check weather for a specific user
   */
  static async checkUserWeather(userPreference: any): Promise<void> {
    try {
      const userId = userPreference.userId._id.toString();

      // Get monitored locations (or use default)
      const locations = userPreference.monitoredLocations || [];

      if (locations.length === 0) {
        console.log(`[WeatherAlertTrigger] No monitored locations for user ${userId}`);
        return;
      }

      for (const location of locations) {
        try {
          await this.checkLocationWeather(userId, location);
        } catch (error) {
          console.error(
            `[WeatherAlertTrigger] Error checking weather for location ${location.name}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error in checkUserWeather:', error);
    }
  }

  /**
   * Check weather for a specific location
   */
  static async checkLocationWeather(userId: string, location: any): Promise<void> {
    try {
      // Fetch current weather data
      const currentWeather = await this.fetchWeatherData(location.latitude, location.longitude);

      if (!currentWeather) {
        console.log(`[WeatherAlertTrigger] Failed to fetch weather for ${location.name}`);
        return;
      }

      // Get cached weather data
      const cacheKey = `${userId}:${location.name}`;
      const previousWeather = weatherCache.get(cacheKey);

      // If no previous data, cache current and return
      if (!previousWeather) {
        weatherCache.set(cacheKey, currentWeather);
        console.log(`[WeatherAlertTrigger] Cached initial weather for ${location.name}`);
        return;
      }

      // Compare weather and trigger alerts if needed
      await this.compareAndTriggerAlerts(userId, previousWeather, currentWeather);

      // Update cache
      weatherCache.set(cacheKey, currentWeather);
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error in checkLocationWeather:', error);
    }
  }

  /**
   * Fetch weather data from API
   */
  static async fetchWeatherData(latitude: number, longitude: number): Promise<WeatherSnapshot | null> {
    try {
      // Call the weather API endpoint
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          locationName: 'Alert Location',
        }),
      });

      if (!response.ok) {
        console.error('[WeatherAlertTrigger] Weather API error:', response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        userId: '', // Will be set by caller
        location: data.location || 'Unknown',
        latitude,
        longitude,
        temperature: data.temperature || 0,
        condition: data.condition || 'Unknown',
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        pressure: data.pressure,
        uvIndex: data.uvIndex,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Compare weather data and trigger alerts
   */
  static async compareAndTriggerAlerts(
    userId: string,
    previousWeather: WeatherSnapshot,
    currentWeather: WeatherSnapshot
  ): Promise<void> {
    try {
      const weatherChangeData: WeatherChangeData = {
        userId,
        location: currentWeather.location,
        latitude: currentWeather.latitude,
        longitude: currentWeather.longitude,
        previousTemp: previousWeather.temperature,
        currentTemp: currentWeather.temperature,
        previousCondition: previousWeather.condition,
        currentCondition: currentWeather.condition,
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed,
        pressure: currentWeather.pressure,
        uvIndex: currentWeather.uvIndex,
      };

      // Send weather alert if conditions warrant it
      const notification = await NotificationService.sendWeatherAlert(
        weatherChangeData,
        'weather_change'
      );

      if (notification) {
        console.log(
          `[WeatherAlertTrigger] Alert sent for ${currentWeather.location}: ${notification.title}`
        );
      }
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error comparing and triggering alerts:', error);
    }
  }

  /**
   * Clear old cache entries (older than 1 hour)
   */
  static clearOldCacheEntries(): void {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const [key, weather] of weatherCache.entries()) {
        if (weather.timestamp.getTime() < oneHourAgo) {
          weatherCache.delete(key);
        }
      }

      console.log('[WeatherAlertTrigger] Cleared old cache entries');
    } catch (error) {
      console.error('[WeatherAlertTrigger] Error clearing cache:', error);
    }
  }

  /**
   * Start the weather alert trigger (runs every 30 minutes)
   */
  static startWeatherAlertTrigger(): NodeJS.Timer {
    console.log('[WeatherAlertTrigger] Starting weather alert trigger (every 30 minutes)');

    // Run immediately
    this.checkWeatherAndTriggerAlerts();

    // Run every 30 minutes
    const interval = setInterval(() => {
      this.checkWeatherAndTriggerAlerts();
      this.clearOldCacheEntries();
    }, 30 * 60 * 1000);

    return interval;
  }

  /**
   * Stop the weather alert trigger
   */
  static stopWeatherAlertTrigger(interval: NodeJS.Timer): void {
    clearInterval(interval);
    console.log('[WeatherAlertTrigger] Stopped weather alert trigger');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: weatherCache.size,
      entries: Array.from(weatherCache.keys()),
    };
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    weatherCache.clear();
    console.log('[WeatherAlertTrigger] Cleared all cache');
  }
}
