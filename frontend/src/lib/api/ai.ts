import { apiClient } from './client';
import {
  AISearchResponse,
  ProductCompareResponse,
  ProductAIInsightResponse,
  ReviewIntelligenceResponse,
  CartAssistantResponse,
} from '@/types';

export const aiApi = {
  executeAISearch: async (query: string, sessionId?: string): Promise<AISearchResponse> => {
    return apiClient<AISearchResponse>('/api/v1/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query, session_id: sessionId }),
    });
  },

  executeConversationalSearch: async (
    message: string,
    sessionId?: string,
    reset?: boolean
  ): Promise<{ success: boolean; session_id: string; message: string; products: unknown[]; query_suggestions: string[] }> => {
    return apiClient('/api/v1/ai/conversational-search', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId, reset }),
    });
  },

  compareProducts: async (productIds: string[]): Promise<ProductCompareResponse> => {
    return apiClient<ProductCompareResponse>('/api/v1/ai/compare', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    });
  },

  getProductInsights: async (productId: string): Promise<ProductAIInsightResponse> => {
    return apiClient<ProductAIInsightResponse>(`/api/v1/ai/products/${productId}/insights`);
  },

  getReviewIntelligence: async (productId: string): Promise<ReviewIntelligenceResponse> => {
    return apiClient<ReviewIntelligenceResponse>(`/api/v1/ai/products/${productId}/review-intelligence`);
  },

  getCartAssistant: async (prompt?: string, targetBudget?: number): Promise<CartAssistantResponse> => {
    return apiClient<CartAssistantResponse>('/api/v1/ai/cart/assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt, target_budget: targetBudget }),
    });
  },
};
