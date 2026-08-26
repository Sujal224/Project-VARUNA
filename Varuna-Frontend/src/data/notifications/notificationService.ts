/**
 * VARUNA Notification Service
 */

import { notificationsApi } from '../api/notifications';
import { NotificationPayload } from './notificationTypes';
import { AppNotification } from '../../domain/models/types';
import { ENV } from '../config/environment';

class NotificationService {
  private notifications: NotificationPayload[] = [
    {
      id: 'notif-1',
      title: 'Cyclone Watch Advisory',
      body: 'Tropical low pressure system tracking 320nm SE. Coastal operations normal.',
      type: 'Cyclone Warning',
      severity: 'warning',
      timestamp: '25m ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'New High-Density PFZ Detected',
      body: 'MODIS pass confirmed Sector Alpha (Swatch Deep) chlorophyll front at 2.4 mg/m³.',
      type: 'New PFZ Detected',
      severity: 'success',
      timestamp: '1h ago',
      read: false,
    },
  ];

  public async getNotifications(): Promise<NotificationPayload[]> {
    try {
      const remote = await notificationsApi.getNotifications();
      return remote.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type as any,
        severity: n.severity,
        timestamp: n.timestamp,
        read: n.read,
        metadata: n.data,
      }));
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return this.notifications;
      }
      throw err;
    }
  }

  public async markAsRead(id: string): Promise<void> {
    const item = this.notifications.find((n) => n.id === id);
    if (item) item.read = true;
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      // Ignored in offline / fallback mode
    }
  }

  public async registerDeviceForPush(pushToken: string, platform: string = 'expo'): Promise<boolean> {
    try {
      const res = await notificationsApi.registerPushToken(pushToken, platform);
      return res.success;
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();
