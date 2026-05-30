import Notification from './models/Notification';
import mongoose from 'mongoose';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

// In-memory queue for failed deliveries
const deliveryQueue: Array<{
  notificationId: string;
  payload: NotificationPayload;
  attempts: number;
  nextRetry: Date;
}> = [];

const MAX_QUEUE_SIZE = 1000;
const RETRY_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5min, 15min, 1hour

export class PushNotificationService {
  /**
   * Send push notification to user
   */
  static async sendPushNotification(
    notificationId: string,
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // Get user's push subscriptions
      const subscriptions = await this.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        console.log(`[PushNotification] No subscriptions found for user ${userId}`);
        return false;
      }

      let successCount = 0;

      for (const subscription of subscriptions) {
        try {
          const success = await this.sendToSubscription(subscription, payload);
          if (success) {
            successCount++;
          } else {
            // Add to retry queue
            this.addToRetryQueue(notificationId, payload);
          }
        } catch (error) {
          console.error('[PushNotification] Error sending to subscription:', error);
          this.addToRetryQueue(notificationId, payload);
        }
      }

      // Update notification delivery status
      if (successCount > 0) {
        await this.updateNotificationDeliveryStatus(notificationId, true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PushNotification] Error in sendPushNotification:', error);
      return false;
    }
  }

  /**
   * Send notification to specific subscription
   */
  static async sendToSubscription(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use web-push library
      // For now, we'll simulate the send
      console.log('[PushNotification] Sending to subscription:', subscription.endpoint);

      // Simulate successful send
      return true;
    } catch (error) {
      console.error('[PushNotification] Error sending to subscription:', error);
      return false;
    }
  }

  /**
   * Get user's push subscriptions
   */
  static async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      // In a real implementation, fetch from database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('[PushNotification] Error getting user subscriptions:', error);
      return [];
    }
  }

  /**
   * Add notification to retry queue
   */
  static addToRetryQueue(notificationId: string, payload: NotificationPayload): void {
    try {
      if (deliveryQueue.length >= MAX_QUEUE_SIZE) {
        console.warn('[PushNotification] Delivery queue is full, dropping oldest item');
        deliveryQueue.shift();
      }

      deliveryQueue.push({
        notificationId,
        payload,
        attempts: 0,
        nextRetry: new Date(),
      });

      console.log(`[PushNotification] Added to retry queue: ${notificationId}`);
    } catch (error) {
      console.error('[PushNotification] Error adding to retry queue:', error);
    }
  }

  /**
   * Process retry queue
   */
  static async processRetryQueue(): Promise<void> {
    try {
      const now = new Date();
      const itemsToRetry = deliveryQueue.filter((item) => item.nextRetry <= now);

      for (const item of itemsToRetry) {
        try {
          const index = deliveryQueue.indexOf(item);

          if (item.attempts >= RETRY_DELAYS.length) {
            console.log(
              `[PushNotification] Max retries reached for ${item.notificationId}, removing from queue`
            );
            deliveryQueue.splice(index, 1);
            continue;
          }

          // Retry sending
          const success = await this.retryNotification(item.notificationId, item.payload);

          if (success) {
            console.log(`[PushNotification] Retry successful for ${item.notificationId}`);
            deliveryQueue.splice(index, 1);
          } else {
            // Schedule next retry
            item.attempts++;
            item.nextRetry = new Date(now.getTime() + RETRY_DELAYS[item.attempts - 1]);
            console.log(
              `[PushNotification] Scheduled retry for ${item.notificationId} at ${item.nextRetry}`
            );
          }
        } catch (error) {
          console.error('[PushNotification] Error processing retry item:', error);
        }
      }
    } catch (error) {
      console.error('[PushNotification] Error processing retry queue:', error);
    }
  }

  /**
   * Retry sending notification
   */
  static async retryNotification(notificationId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      // Get notification from database
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        console.log(`[PushNotification] Notification not found: ${notificationId}`);
        return false;
      }

      // Retry sending
      const subscriptions = await this.getUserSubscriptions(notification.userId.toString());

      if (subscriptions.length === 0) {
        return false;
      }

      let successCount = 0;

      for (const subscription of subscriptions) {
        try {
          const success = await this.sendToSubscription(subscription, payload);
          if (success) {
            successCount++;
          }
        } catch (error) {
          console.error('[PushNotification] Error retrying subscription:', error);
        }
      }

      return successCount > 0;
    } catch (error) {
      console.error('[PushNotification] Error in retryNotification:', error);
      return false;
    }
  }

  /**
   * Update notification delivery status
   */
  static async updateNotificationDeliveryStatus(notificationId: string, delivered: boolean): Promise<void> {
    try {
      await Notification.findByIdAndUpdate(
        notificationId,
        {
          delivered,
          lastDeliveryAttempt: new Date(),
        },
        { new: true }
      );
    } catch (error) {
      console.error('[PushNotification] Error updating delivery status:', error);
    }
  }

  /**
   * Send in-app notification (fallback)
   */
  static async sendInAppNotification(
    notificationId: string,
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // In-app notifications are already stored in database
      // This is just a marker that we're using in-app delivery
      console.log(`[PushNotification] Sending in-app notification to user ${userId}`);

      await this.updateNotificationDeliveryStatus(notificationId, true);
      return true;
    } catch (error) {
      console.error('[PushNotification] Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Send email notification (optional)
   */
  static async sendEmailNotification(
    notificationId: string,
    userEmail: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      console.log(`[PushNotification] Sending email notification to ${userEmail}`);

      // In a real implementation, use email service
      // For now, just log
      return true;
    } catch (error) {
      console.error('[PushNotification] Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send notification with fallback chain
   */
  static async sendNotificationWithFallback(
    notificationId: string,
    userId: string,
    userEmail: string,
    payload: NotificationPayload,
    preferences: any
  ): Promise<boolean> {
    try {
      let sent = false;

      // Try push notification first
      if (preferences.pushNotificationsEnabled) {
        sent = await this.sendPushNotification(notificationId, userId, payload);
      }

      // Fallback to in-app notification
      if (!sent && preferences.inAppNotificationsEnabled) {
        sent = await this.sendInAppNotification(notificationId, userId, payload);
      }

      // Optional: send email
      if (preferences.emailNotificationsEnabled) {
        await this.sendEmailNotification(notificationId, userEmail, payload);
      }

      return sent;
    } catch (error) {
      console.error('[PushNotification] Error in sendNotificationWithFallback:', error);
      return false;
    }
  }

  /**
   * Start retry queue processor (runs every 5 minutes)
   */
  static startRetryQueueProcessor(): NodeJS.Timer {
    console.log('[PushNotification] Starting retry queue processor');

    const interval = setInterval(() => {
      this.processRetryQueue();
    }, 5 * 60 * 1000);

    return interval;
  }

  /**
   * Stop retry queue processor
   */
  static stopRetryQueueProcessor(interval: NodeJS.Timer): void {
    clearInterval(interval);
    console.log('[PushNotification] Stopped retry queue processor');
  }

  /**
   * Get queue statistics
   */
  static getQueueStats(): {
    size: number;
    maxSize: number;
    oldestItem?: Date;
    newestItem?: Date;
  } {
    return {
      size: deliveryQueue.length,
      maxSize: MAX_QUEUE_SIZE,
      oldestItem: deliveryQueue.length > 0 ? deliveryQueue[0].nextRetry : undefined,
      newestItem: deliveryQueue.length > 0 ? deliveryQueue[deliveryQueue.length - 1].nextRetry : undefined,
    };
  }

  /**
   * Clear retry queue
   */
  static clearRetryQueue(): void {
    deliveryQueue.length = 0;
    console.log('[PushNotification] Cleared retry queue');
  }
}
