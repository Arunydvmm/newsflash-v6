import mongoose, { Schema, Document } from 'mongoose';

export interface IWeatherAlert extends Document {
  userId: mongoose.Types.ObjectId;
  location: string;
  latitude: number;
  longitude: number;
  previousTemperature: number;
  currentTemperature: number;
  temperatureChange: number;
  previousCondition: string;
  currentCondition: string;
  alertType: 'temperature_change' | 'storm' | 'extreme_temp';
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationSent: boolean;
  notificationId?: mongoose.Types.ObjectId;
  lastAlertTime?: Date;
  cooldownUntil?: Date;
  metadata: {
    humidity?: number;
    windSpeed?: number;
    pressure?: number;
    uvIndex?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WeatherAlertSchema = new Schema<IWeatherAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    previousTemperature: {
      type: Number,
      required: true,
    },
    currentTemperature: {
      type: Number,
      required: true,
    },
    temperatureChange: {
      type: Number,
      required: true,
    },
    previousCondition: {
      type: String,
      required: true,
    },
    currentCondition: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ['temperature_change', 'storm', 'extreme_temp'],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
    lastAlertTime: Date,
    cooldownUntil: Date,
    metadata: {
      humidity: Number,
      windSpeed: Number,
      pressure: Number,
      uvIndex: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
WeatherAlertSchema.index({ userId: 1, createdAt: -1 });
WeatherAlertSchema.index({ userId: 1, alertType: 1 });
WeatherAlertSchema.index({ userId: 1, severity: 1 });
WeatherAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export const WeatherAlert =
  mongoose.models.WeatherAlert ||
  mongoose.model<IWeatherAlert>('WeatherAlert', WeatherAlertSchema);
