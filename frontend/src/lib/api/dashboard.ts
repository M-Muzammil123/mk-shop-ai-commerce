import { apiClient } from './client';
import { DashboardAnalytics, Product } from '@/types';

export const dashboardApi = {
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    return apiClient<DashboardAnalytics>('/api/v1/dashboard/analytics');
  },

  getUserRecommendations: async (limit: number = 4): Promise<Product[]> => {
    return apiClient<Product[]>('/api/v1/dashboard/recommendations', {
      params: { limit },
    });
  },

  getSimilarProducts: async (productId: string, limit: number = 4): Promise<Product[]> => {
    return apiClient<Product[]>(`/api/v1/dashboard/products/${productId}/similar`, {
      params: { limit },
    });
  },

  getAISearchAnalytics: async (): Promise<Record<string, unknown>> => {
    return apiClient<Record<string, unknown>>('/api/v1/dashboard/ai-search-analytics');
  },
};
