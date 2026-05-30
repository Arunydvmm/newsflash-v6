import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'weather_alert' | 'article' | 'system';
  title: string;
  body: string;
  data: {
    temperature?: number;
    condition?: string;
    location?: string;
    link?: string;
    icon?: string;
    timestamp?: Date;
  };
  read: boolean;
  delivered: boolean;
  deliveryAttempts: number;
  lastDeliveryAttempt?: Date;
  deliveryError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['weather_alert', 'article', 'system'],
      default: 'weather_alert',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      temperature: Number,
      condition: String,
      location: String,
      link: String,
      icon: String,
      timestamp: Date,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    lastDeliveryAttempt: Date,
    deliveryError: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
