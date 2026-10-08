import { apiClient } from './client';
import { Review } from '@/types';

export interface CreateReviewInput {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}

export const reviewsApi = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    return apiClient<Review[]>(`/api/v1/reviews/product/${productId}`);
  },

  createReview: async (data: CreateReviewInput): Promise<Review> => {
    return apiClient<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approveReview: async (reviewId: string): Promise<Review> => {
    return apiClient<Review>(`/api/v1/reviews/${reviewId}/approve`, {
      method: 'PUT',
    });
  },

  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};
