import api from "./api";

export interface ComponentScoreBreakdown {
  requirement_match: number;
  price_fit: number;
  review_signal: number;
  delivery_fit: number;
  overall_score: number;
}

export interface DiscoveredProduct {
  id?: string;
  product_name: string;
  brand?: string;
  model?: string;
  price: number;
  currency: string;
  original_price?: number | null;
  discount?: number | null;
  availability: string;
  seller: string;
  seller_rating?: number | null;
  product_rating?: number | null;
  review_count?: number | null;
  condition?: string;
  specifications: Record<string, any>;
  shipping_cost?: number | null;
  delivery_estimate?: string | null;
  warranty?: string | null;
  country_code: string;
  source_url: string;
  source_domain: string;
  image_url?: string | null;
  cross_border: boolean;
  retrieved_at: string;
  score_breakdown?: ComponentScoreBreakdown | null;
  match_reasons?: string[];
  pros?: string[];
  cons?: string[];
  is_internal?: boolean;
}

export interface ComparisonFeatureRow {
  feature: string;
  values: Record<string, string>;
}

export interface ProductComparisonResult {
  products: DiscoveredProduct[];
  matrix: ComparisonFeatureRow[];
  best_overall_index?: number;
  best_value_index?: number;
  best_delivery_index?: number;
  pros_and_cons: Record<string, { pros: string[]; cons: string[] }>;
  ai_summary: string;
}

export interface AgentCitation {
  title: string;
  url: string;
  domain: string;
  retrieved_at: string;
  snippet?: string | null;
}

export interface AgentActivityStep {
  step: string;
  status: string;
  detail: string;
  timestamp: string;
}

export interface ShoppingAgentChatResponse {
  success: boolean;
  session_id: string;
  message: string;
  intent: string;
  country: string;
  currency: string;
  requirements?: any;
  clarification_question?: string | null;
  products: DiscoveredProduct[];
  comparison?: ProductComparisonResult | null;
  citations: AgentCitation[];
  activity_steps: AgentActivityStep[];
  next_action: string;
  latency_ms: number;
}

export interface VoiceSessionResponse {
  success: boolean;
  session_id: string;
  transcript: string;
  spoken_reply: string;
  audio_base64?: string | null;
  chat_response: ShoppingAgentChatResponse;
}

export interface CheckoutConfirmResponse {
  success: boolean;
  order_id: string;
  confirmation_token: string;
  subtotal: number;
  shipping_amount: number;
  estimated_tax: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  delivery_estimate: string;
  is_simulation: boolean;
  items: Array<{ product_name: string; price: number; quantity: number }>;
  message: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  status: string;
  order_id: string;
  amount: number;
  currency: string;
  is_simulation: boolean;
  message: string;
  transaction_id: string;
}

export const agentService = {
  chat: async (params: {
    message: string;
    session_id?: string;
    country?: string;
    currency?: string;
    city?: string;
    reset?: boolean;
  }): Promise<ShoppingAgentChatResponse> => {
    const res = await api.post("/agent/chat", params);
    return res.data;
  },

  voiceSession: async (params: {
    transcript_input?: string;
    audio_base64?: string;
    session_id?: string;
    country?: string;
    currency?: string;
  }): Promise<VoiceSessionResponse> => {
    const res = await api.post("/agent/voice/session", params);
    return res.data;
  },

  compare: async (products: DiscoveredProduct[]): Promise<ProductComparisonResult> => {
    const res = await api.post("/agent/compare", products);
    return res.data;
  },

  addToCart: async (product: DiscoveredProduct, quantity: number = 1) => {
    const res = await api.post("/agent/cart/add", { product, quantity });
    return res.data;
  },

  prepareCheckout: async (params: { payment_provider?: string } = {}) => {
    const res = await api.post("/agent/checkout/confirm", params);
    return res.data as CheckoutConfirmResponse;
  },

  confirmPayment: async (params: { order_id: string; confirmation_token: string; provider?: string }) => {
    const res = await api.post("/agent/payment/confirm", params);
    return res.data as PaymentConfirmResponse;
  },

  getSession: async (sessionId: string) => {
    const res = await api.get(`/agent/sessions/${sessionId}`);
    return res.data;
  },
};
