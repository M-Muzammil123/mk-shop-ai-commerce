// Central TypeScript Type Definitions mirroring backend schemas

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  profile_id?: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_province?: string | null;
  postal_code: string;
  country: string;
  is_default?: boolean;
  created_at?: string;
}

export interface AddressCreateInput {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_province?: string | null;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  profile: Profile;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  product_id?: string;
}

export interface Inventory {
  id: string;
  quantity: number;
  low_stock_threshold: number;
  product_id?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  compare_at_price?: string | number | null;
  sku?: string | null;
  status: string;
  is_featured: boolean;
  category_id?: number | null;
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
  inventory?: Inventory | null;
  category?: Category | null;
}

export interface PaginatedProducts {
  success: boolean;
  total: number;
  skip: number;
  limit: number;
  products: Product[];
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  created_at?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: string;
  profile_id: string;
  product_id: string;
  product?: Product;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  quantity: number;
  price: string | number;
  created_at?: string;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  transaction_id?: string | null;
  amount: string | number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  profile_id?: string | null;
  status: string;
  total_amount: string | number;
  tax_amount: string | number;
  shipping_amount: string | number;
  discount_amount: string | number;
  coupon_id?: string | null;
  shipping_address_id?: string | null;
  billing_address_id?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment | null;
  shipping_address?: Address | null;
  billing_address?: Address | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string | number;
  min_purchase_amount: string | number;
  start_date: string;
  end_date: string;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  profile_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

// AI & Shopping Agent Schemas
export interface ComponentScoreBreakdown {
  requirement_match: number;
  price_fit: number;
  review_signal: number;
  delivery_fit: number;
  overall_score: number;
}

export interface StructuredShoppingRequirements {
  country: string;
  city?: string | null;
  language: string;
  currency: string;
  category?: string | null;
  query: string;
  budget_min?: number | null;
  budget_max?: number | null;
  brand: string[];
  condition: string;
  required_specs: Record<string, unknown>;
  preferred_specs: Record<string, unknown>;
  quantity: number;
  delivery_deadline_days?: number | null;
  shipping_required: boolean;
  quality_priority: number;
  price_priority: number;
  delivery_priority: number;
  raw_prompt?: string | null;
}

export interface DiscoveredProduct {
  id?: string | null;
  product_name: string;
  brand?: string | null;
  model?: string | null;
  price: number;
  currency: string;
  original_price?: number | null;
  discount?: number | null;
  availability: string;
  seller: string;
  seller_rating?: number | null;
  product_rating?: number | null;
  review_count?: number | null;
  condition: string;
  specifications: Record<string, unknown>;
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
  match_reasons: string[];
  pros: string[];
  cons: string[];
  is_internal: boolean;
}

export interface ComparisonFeatureRow {
  feature: string;
  values: Record<string, string>;
}

export interface ProductComparisonResult {
  products: DiscoveredProduct[];
  matrix: ComparisonFeatureRow[];
  best_overall_index?: number | null;
  best_value_index?: number | null;
  best_delivery_index?: number | null;
  pros_and_cons: Record<string, Record<string, string[]>>;
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
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | string;
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
  requirements?: StructuredShoppingRequirements | null;
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

export interface ShoppingAnalyticsSummary {
  total_ai_searches: number;
  top_countries: Array<Record<string, unknown>>;
  popular_categories: Array<Record<string, unknown>>;
  tool_success_rate: number;
  avg_search_latency_ms: number;
  provider_usage: Record<string, number>;
  estimated_ai_cost: number;
  conversion_to_cart_rate: number;
  conversion_to_checkout_rate: number;
  simulated_payment_count: number;
}

// Product Insights & Review Intelligence
export interface ProductAIInsightResponse {
  product_id: string;
  why_this_product: string[];
  best_for: string;
  potential_downside: string;
  match_score: number;
}

export interface ReviewIntelligenceResponse {
  product_id: string;
  overall_sentiment: string;
  positive_percentage: number;
  customers_love: string[];
  common_complaints: string[];
  total_reviews_analyzed: number;
}

export interface ProductCompareResponse {
  success: boolean;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    is_featured: boolean;
    status: string;
    images?: Array<{ image_url: string; is_primary: boolean }>;
    match_score?: number;
    attributes?: Record<string, unknown>;
    specifications?: Record<string, unknown>;
  }>;
  spec_table: Array<{
    feature: string;
    values: Record<string, string>;
  }>;
  best_overall_id?: string;
  best_value_id?: string;
  best_performance_id?: string;
  ai_summary: string;
}

export interface AISearchResponse {
  success: boolean;
  query: string;
  intent: string;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url?: string;
    match_score: number;
    match_reasons: string[];
    why_recommended?: string;
    specifications?: Record<string, unknown>;
  }>;
  constraints?: Record<string, unknown>;
}

export interface CartAssistantResponse {
  success: boolean;
  current_subtotal: number;
  target_budget?: number | null;
  within_budget: boolean;
  message: string;
  recommendations: Array<{
    product_id: string;
    name: string;
    price: number;
    reason: string;
  }>;
}

// Dashboard Analytics
export interface DashboardAnalytics {
  revenue_card: { value: number; change_percentage: number; label: string };
  orders_card: { value: number; change_percentage: number; label: string };
  products_card: { value: number; change_percentage: number; label: string };
  customers_card: { value: number; change_percentage: number; label: string };
  sales_chart: Array<{ date: string; revenue: number; orders_count: number }>;
  recent_orders: Array<{
    id: string;
    customer: string;
    email: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  best_sellers: Array<{
    id: string;
    name: string;
    price: number;
    sold_quantity: number;
  }>;
}
