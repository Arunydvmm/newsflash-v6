import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreference extends Document {
  userId: mongoose.Types.ObjectId;
  notificationsEnabled: boolean;
  notificationTypes: {
    weatherAlerts: boolean;
    articles: boolean;
    system: boolean;
  };
  weatherAlertTypes: {
    temperatureChange: boolean;
    storms: boolean;
    extremeTemps: boolean;
  };
  temperatureThreshold: number; // in Celsius (default: 5)
  extremeTempLow: number; // in Celsius (default: 0)
  extremeTempHigh: number; // in Celsius (default: 40)
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  notificationFrequency: 'all' | 'storms_only' | 'extreme_only'; // default: 'all'
  monitoredLocations: Array<{
    name: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
  }>;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    notificationTypes: {
      weatherAlerts: {
        type: Boolean,
        default: true,
      },
      articles: {
        type: Boolean,
        default: true,
      },
      system: {
        type: Boolean,
        default: true,
      },
    },
    weatherAlertTypes: {
      temperatureChange: {
        type: Boolean,
        default: true,
      },
      storms: {
        type: Boolean,
        default: true,
      },
      extremeTemps: {
        type: Boolean,
        default: true,
      },
    },
    temperatureThreshold: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
    extremeTempLow: {
      type: Number,
      default: 0,
      min: -50,
      max: 10,
    },
    extremeTempHigh: {
      type: Number,
      default: 40,
      min: 30,
      max: 60,
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: String,
        default: '22:00',
      },
      endTime: {
        type: String,
        default: '08:00',
      },
    },
    notificationFrequency: {
      type: String,
      enum: ['all', 'storms_only', 'extreme_only'],
      default: 'all',
    },
    monitoredLocations: [
      {
        name: String,
        latitude: Number,
        longitude: Number,
        isDefault: Boolean,
      },
    ],
    pushNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: false,
    },
    inAppNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserPreferenceModel = mongoose.models.UserPreference ||
  mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema);

export default UserPreferenceModel as any;
