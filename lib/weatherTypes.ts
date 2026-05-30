/**
 * Weather Types - Aethercast format for newsflash integration
 * Defines all TypeScript interfaces for weather data
 */

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy' | 'stormy';
  pop: number; // probability of precipitation %
}

export interface DayForecast {
  dayName: string; // e.g. "Today", "Monday", "Tuesday"
  dayShort: string; // e.g. "TODAY", "MON", "TUE"
  date: string; // e.g. "May 28"
  tempMax: number;
  tempMin: number;
  condition: string;
  description: string;
  iconName: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy' | 'stormy';
  pop: number; // probability of precipitation %
  hourly: HourlyForecast[];
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  uvLevel: string; // "Low", "Moderate", "High", "Very High"
  visibility: number; // in km
  aqiValue: number;
  aqiLevel: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  aqiColor: string; // Tailwind color class
  sunriseTime: string; // "05:42"
  sunsetTime: string; // "21:14"
  pressureValue: number; // in hPa
  pressureTrend: 'Steady rising' | 'Steady falling' | 'Stable';
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  latitude: string; // formatted with cardinal direction e.g. "40.7128° N"
  longitude: string; // formatted with cardinal direction e.g. "74.0060° W"
  timezone: string; // e.g. "EST (GMT-5)"
  forecast: DayForecast[];
}

/**
 * AccuWeather API Response Types
 */
export interface AccuWeatherCurrentCondition {
  Temperature?: {
    Metric?: {
      Value: number;
    };
  };
  WeatherText?: string;
  WeatherIcon?: number;
  RelativeHumidity?: number;
  Wind?: {
    Speed?: {
      Metric?: {
        Value: number;
      };
    };
    Direction?: {
      Localized?: string;
    };
  };
  UVIndex?: number;
  Visibility?: {
    Metric?: {
      Value: number;
    };
  };
  DewPoint?: {
    Metric?: {
      Value: number;
    };
  };
  ApparentTemperature?: {
    Metric?: {
      Value: number;
    };
  };
  Pressure?: {
    Metric?: {
      Value: number;
    };
  };
  WindGustSpeed?: {
    Metric?: {
      Value: number;
    };
  };
}

export interface AccuWeatherForecastDay {
  Date: string;
  Temperature?: {
    Maximum?: {
      Value: number;
    };
    Minimum?: {
      Value: number;
    };
  };
  Day?: {
    IconPhrase?: string;
    Icon?: number;
    PrecipitationProbability?: number;
    Wind?: {
      Speed?: {
        Metric?: {
          Value: number;
        };
      };
    };
  };
  TotalLiquid?: {
    Value: number;
  };
}

export interface AccuWeatherHourlyForecast {
  DateTime: string;
  Temperature?: {
    Metric?: {
      Value: number;
    };
  };
  IconPhrase?: string;
  WeatherIcon?: number;
  TotalLiquid?: {
    Value: number;
  };
  RelativeHumidity?: number;
}

export interface AccuWeatherResponse {
  location: string;
  lat: number;
  lon: number;
  current: AccuWeatherCurrentCondition;
  forecast: AccuWeatherForecastDay[];
  hourly: AccuWeatherHourlyForecast[];
}

/**
 * Location Information
 */
export interface LocationInfo {
  cityName: string;
  country: string;
  latitude: string; // formatted with cardinal direction
  longitude: string; // formatted with cardinal direction
  timezone: string;
  lastUpdated: string; // relative time like "2 mins ago"
}
