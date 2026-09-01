/**
 * VARUNA Notifications API
 */

import { apiClient } from './client';
import { AppNotification } from '../../domain/models/types';

export const notificationsApi = {
  async getNotifications(limit: number = 20): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>('/notifications', {
      params: { limit },
    });
  },

  async registerPushToken(token: string, platform: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/notifications/register-device', {
      push_token: token,
      platform,
    });
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/notifications/${notificationId}/read`);
  },
};
