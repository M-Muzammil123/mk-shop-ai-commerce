import { apiClient } from './client';
import { Notification } from '@/types';

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    return apiClient<Notification[]>('/api/v1/notifications');
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    return apiClient<Notification>(`/api/v1/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>('/api/v1/notifications/read-all', {
      method: 'POST',
    });
  },
};
