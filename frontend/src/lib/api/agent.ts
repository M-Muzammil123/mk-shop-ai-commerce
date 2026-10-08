import { apiClient } from './client';
import {
  ShoppingAgentChatResponse,
  VoiceSessionResponse,
  DiscoveredProduct,
  ProductComparisonResult,
  CheckoutConfirmResponse,
  PaymentConfirmResponse,
  ShoppingAnalyticsSummary,
} from '@/types';

export interface AgentChatInput {
  message: string;
  session_id?: string;
  country?: string;
  currency?: string;
  city?: string;
  language?: string;
  reset?: boolean;
}

export interface VoiceSessionInput {
  session_id?: string;
  country?: string;
  currency?: string;
  audio_base64?: string;
  transcript_input?: string;
}

export interface AddDiscoveredProductInput {
  session_id?: string;
  product: DiscoveredProduct;
  quantity?: number;
}

export interface AgentCheckoutConfirmInput {
  session_id?: string;
  shipping_address?: Record<string, unknown>;
  coupon_code?: string;
  payment_provider?: string;
}

export interface AgentPaymentConfirmInput {
  order_id: string;
  confirmation_token: string;
  provider?: string;
}

export const agentApi = {
  chat: async (input: AgentChatInput): Promise<ShoppingAgentChatResponse> => {
    return apiClient<ShoppingAgentChatResponse>('/api/v1/agent/chat', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  voiceSession: async (input: VoiceSessionInput): Promise<VoiceSessionResponse> => {
    return apiClient<VoiceSessionResponse>('/api/v1/agent/voice/session', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  compare: async (products: DiscoveredProduct[]): Promise<ProductComparisonResult> => {
    return apiClient<ProductComparisonResult>('/api/v1/agent/compare', {
      method: 'POST',
      body: JSON.stringify(products),
    });
  },

  addToCart: async (input: AddDiscoveredProductInput): Promise<{ success: boolean; message: string; cart_item_id: string }> => {
    return apiClient<{ success: boolean; message: string; cart_item_id: string }>('/api/v1/agent/cart/add', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  checkoutConfirm: async (input: AgentCheckoutConfirmInput): Promise<CheckoutConfirmResponse> => {
    return apiClient<CheckoutConfirmResponse>('/api/v1/agent/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  paymentConfirm: async (input: AgentPaymentConfirmInput): Promise<PaymentConfirmResponse> => {
    return apiClient<PaymentConfirmResponse>('/api/v1/agent/payment/confirm', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getSessions: async (): Promise<Array<{ id: string; title?: string; created_at?: string; last_message?: string }>> => {
    return apiClient<Array<{ id: string; title?: string; created_at?: string; last_message?: string }>>('/api/v1/agent/sessions');
  },

  getSession: async (sessionId: string): Promise<Record<string, unknown>> => {
    return apiClient<Record<string, unknown>>(`/api/v1/agent/sessions/${sessionId}`);
  },

  getAnalytics: async (): Promise<ShoppingAnalyticsSummary> => {
    return apiClient<ShoppingAnalyticsSummary>('/api/v1/agent/analytics');
  },
};
