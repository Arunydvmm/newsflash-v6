import { Notification, INotification } from './models/Notification';
import UserPreference from './models/UserPreference';
import { WeatherAlert } from './models/WeatherAlert';
import mongoose from 'mongoose';

export interface WeatherChangeData {
  userId: string;
  location: string;
  latitude: number;
  longitude: number;
  previousTemp: number;
  currentTemp: number;
  previousCondition: string;
  currentCondition: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
}

export interface NotificationData {
  temperature?: number;
  condition?: string;
  location?: string;
  link?: string;
  icon?: string;
  timestamp?: Date;
}

const COOLDOWN_PERIOD = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const MAX_DELIVERY_ATTEMPTS = 3;

export class NotificationService {
  /**
   * Check if a notification should be sent based on weather changes
   */
  static async shouldSendNotification(data: WeatherChangeData): Promise<boolean> {
    try {
      const userPreference = await UserPreference.findOne({ userId: data.userId });

      if (!userPreference || !userPreference.notificationsEnabled) {
        return false;
      }

      // Check quiet hours
      if (this.isInQuietHours(userPreference.quietHours)) {
        return false;
      }

      // Check if notification is in cooldown
      const recentAlert = await WeatherAlert.findOne({
        userId: data.userId,
        location: data.location,
        cooldownUntil: { $gt: new Date() },
      });

      if (recentAlert) {
        return false;
      }

      // Determine alert type and check if enabled
      const alertType = this.determineAlertType(data, userPreference);

      if (!alertType) {
        return false;
      }

      // Check notification frequency preference
      if (userPreference.notificationFrequency === 'storms_only' && alertType !== 'storm') {
        return false;
      }

      if (userPreference.notificationFrequency === 'extreme_only' && alertType !== 'extreme_temp') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking notification eligibility:', error);
      return false;
    }
  }

  /**
   * Determine the type of weather alert
   */
  static determineAlertType(
    data: WeatherChangeData,
    userPreference: any
  ): 'temperature_change' | 'storm' | 'extreme_temp' | null {
    const tempChange = Math.abs(data.currentTemp - data.previousTemp);
    const isStorm = this.isStormCondition(data.currentCondition);
    const isExtremeTemp =
      data.currentTemp < userPreference.extremeTempLow ||
      data.currentTemp > userPreference.extremeTempHigh;

    // Check storm condition
    if (isStorm && userPreference.weatherAlertTypes.storms) {
      return 'storm';
    }

    // Check extreme temperature
    if (isExtremeTemp && userPreference.weatherAlertTypes.extremeTemps) {
      return 'extreme_temp';
    }

    // Check temperature change
    if (
      tempChange >= userPreference.temperatureThreshold &&
      userPreference.weatherAlertTypes.temperatureChange
    ) {
      return 'temperature_change';
    }

    return null;
  }

  /**
   * Check if weather condition is a storm
   */
  static isStormCondition(condition: string): boolean {
    const stormKeywords = ['rain', 'thunderstorm', 'storm', 'lightning', 'heavy rain', 'downpour'];
    return stormKeywords.some((keyword) => condition.toLowerCase().includes(keyword));
  }

  /**
   * Check if current time is within quiet hours
   */
  static isInQuietHours(quietHours: any): boolean {
    if (!quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    const currentTotalMin = currentHour * 60 + currentMin;

    // Handle case where quiet hours span midnight
    if (startTotalMin > endTotalMin) {
      return currentTotalMin >= startTotalMin || currentTotalMin < endTotalMin;
    }

    return currentTotalMin >= startTotalMin && currentTotalMin < endTotalMin;
  }

  /**
   * Create a notification
   */
  static async createNotification(
    userId: string,
    type: 'weather_alert' | 'article' | 'system',
    title: string,
    body: string,
    data: NotificationData
  ): Promise<INotification> {
    try {
      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        body,
        data,
        read: false,
        delivered: false,
        deliveryAttempts: 0,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create a weather alert
   */
  static async createWeatherAlert(data: WeatherChangeData, alertType: string): Promise<any> {
    try {
      const severity = this.calculateSeverity(data, alertType);

      const weatherAlert = new WeatherAlert({
        userId: new mongoose.Types.ObjectId(data.userId),
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        previousTemperature: data.previousTemp,
        currentTemperature: data.currentTemp,
        temperatureChange: Math.abs(data.currentTemp - data.previousTemp),
        previousCondition: data.previousCondition,
        currentCondition: data.currentCondition,
        alertType,
        severity,
        notificationSent: false,
        cooldownUntil: new Date(Date.now() + COOLDOWN_PERIOD),
        metadata: {
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          pressure: data.pressure,
          uvIndex: data.uvIndex,
        },
      });

      await weatherAlert.save();
      return weatherAlert;
    } catch (error) {
      console.error('Error creating weather alert:', error);
      throw error;
    }
  }

  /**
   * Calculate severity of weather alert
   */
  static calculateSeverity(data: WeatherChangeData, alertType: string): 'low' | 'medium' | 'high' | 'critical' {
    if (alertType === 'storm') {
      return 'high';
    }

    if (alertType === 'extreme_temp') {
      const tempDiff = Math.abs(data.currentTemp);
      if (tempDiff > 30) return 'critical';
      if (tempDiff > 20) return 'high';
      return 'medium';
    }

    const tempChange = Math.abs(data.currentTemp - data.previousTemp);
    if (tempChange > 10) return 'high';
    if (tempChange > 7) return 'medium';
    return 'low';
  }

  /**
   * Send weather alert notification
   */
  static async sendWeatherAlert(data: WeatherChangeData, alertType: string): Promise<INotification | null> {
    try {
      // Check if notification should be sent
      const shouldSend = await this.shouldSendNotification(data);
      if (!shouldSend) {
        return null;
      }

      // Create weather alert record
      const weatherAlert = await this.createWeatherAlert(data, alertType);

      // Create notification
      const title = this.generateNotificationTitle(data, alertType);
      const body = this.generateNotificationBody(data, alertType);
      const notificationData: NotificationData = {
        temperature: data.currentTemp,
        condition: data.currentCondition,
        location: data.location,
        link: `/weather?lat=${data.latitude}&lon=${data.longitude}`,
        timestamp: new Date(),
      };

      const notification = await this.createNotification(
        data.userId,
        'weather_alert',
        title,
        body,
        notificationData
      );

      // Update weather alert with notification ID
      weatherAlert.notificationId = notification._id;
      weatherAlert.notificationSent = true;
      await weatherAlert.save();

      return notification;
    } catch (error) {
      console.error('Error sending weather alert:', error);
      return null;
    }
  }

  /**
   * Generate notification title
   */
  static generateNotificationTitle(data: WeatherChangeData, alertType: string): string {
    if (alertType === 'storm') {
      return '⚠️ Storm Alert';
    }

    if (alertType === 'extreme_temp') {
      if (data.currentTemp < 0) {
        return '❄️ Extreme Cold Alert';
      }
      return '🔥 Extreme Heat Alert';
    }

    if (data.currentTemp > data.previousTemp) {
      return '📈 Temperature Rising';
    }

    return '📉 Temperature Dropping';
  }

  /**
   * Generate notification body
   */
  static generateNotificationBody(data: WeatherChangeData, alertType: string): string {
    const tempChange = Math.abs(data.currentTemp - data.previousTemp);

    if (alertType === 'storm') {
      return `${data.location}: ${data.currentCondition} - Current temp: ${data.currentTemp}°C`;
    }

    if (alertType === 'extreme_temp') {
      return `${data.location}: Extreme temperature of ${data.currentTemp}°C - ${data.currentCondition}`;
    }

    return `${data.location}: Temperature changed by ${tempChange}°C to ${data.currentTemp}°C - ${data.currentCondition}`;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<INotification | null> {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);
      return !!result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 20, skip: number = 0) {
    try {
      const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });

      return { notifications, total };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
