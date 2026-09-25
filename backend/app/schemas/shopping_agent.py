from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime


class ComponentScoreBreakdown(BaseModel):
    requirement_match: int = Field(ge=0, le=100, default=85)
    price_fit: int = Field(ge=0, le=100, default=85)
    review_signal: int = Field(ge=0, le=100, default=80)
    delivery_fit: int = Field(ge=0, le=100, default=80)
    overall_score: int = Field(ge=0, le=100, default=85)

    model_config = ConfigDict(from_attributes=True)


class StructuredShoppingRequirements(BaseModel):
    country: str = "PK"
    city: Optional[str] = None
    language: str = "en"
    currency: str = "PKR"
    category: Optional[str] = None
    query: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    brand: List[str] = []
    condition: str = "new"
    required_specs: Dict[str, Any] = {}
    preferred_specs: Dict[str, Any] = {}
    quantity: int = 1
    delivery_deadline_days: Optional[int] = None
    shipping_required: bool = True
    quality_priority: float = 0.8
    price_priority: float = 0.9
    delivery_priority: float = 0.8
    raw_prompt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DiscoveredProduct(BaseModel):
    id: Optional[str] = None
    product_name: str
    brand: Optional[str] = None
    model: Optional[str] = None
    price: float
    currency: str
    original_price: Optional[float] = None
    discount: Optional[float] = None
    availability: str = "in_stock"
    seller: str
    seller_rating: Optional[float] = None
    product_rating: Optional[float] = None
    review_count: Optional[int] = None
    condition: str = "new"
    specifications: Dict[str, Any] = {}
    shipping_cost: Optional[float] = None
    delivery_estimate: Optional[str] = None
    warranty: Optional[str] = None
    country_code: str
    source_url: str
    source_domain: str
    image_url: Optional[str] = None
    cross_border: bool = False
    retrieved_at: str
    score_breakdown: Optional[ComponentScoreBreakdown] = None
    match_reasons: List[str] = []
    pros: List[str] = []
    cons: List[str] = []
    is_internal: bool = False

    model_config = ConfigDict(from_attributes=True)


class ComparisonFeatureRow(BaseModel):
    feature: str
    values: Dict[str, str]

    model_config = ConfigDict(from_attributes=True)


class ProductComparisonResult(BaseModel):
    products: List[DiscoveredProduct] = []
    matrix: List[ComparisonFeatureRow] = []
    best_overall_index: Optional[int] = None
    best_value_index: Optional[int] = None
    best_delivery_index: Optional[int] = None
    pros_and_cons: Dict[str, Dict[str, List[str]]] = {}
    ai_summary: str = ""

    model_config = ConfigDict(from_attributes=True)


class AgentCitation(BaseModel):
    title: str
    url: str
    domain: str
    retrieved_at: str
    snippet: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AgentActivityStep(BaseModel):
    step: str
    status: str = "completed"  # pending, in_progress, completed, failed
    detail: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)


class ShoppingAgentChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    city: Optional[str] = None
    language: Optional[str] = "en"
    reset: bool = False


class ShoppingAgentChatResponse(BaseModel):
    success: bool = True
    session_id: str
    message: str
    intent: str = "product_search"
    country: str = "PK"
    currency: str = "PKR"
    requirements: Optional[StructuredShoppingRequirements] = None
    clarification_question: Optional[str] = None
    products: List[DiscoveredProduct] = []
    comparison: Optional[ProductComparisonResult] = None
    citations: List[AgentCitation] = []
    activity_steps: List[AgentActivityStep] = []
    next_action: str = "review"  # clarify, review, compare, cart, checkout, confirm_payment
    latency_ms: int = 0

    model_config = ConfigDict(from_attributes=True)


class VoiceSessionRequest(BaseModel):
    session_id: Optional[str] = None
    country: Optional[str] = "PK"
    currency: Optional[str] = "PKR"
    audio_base64: Optional[str] = None
    transcript_input: Optional[str] = None


class VoiceSessionResponse(BaseModel):
    success: bool = True
    session_id: str
    transcript: str
    spoken_reply: str
    audio_base64: Optional[str] = None
    chat_response: ShoppingAgentChatResponse

    model_config = ConfigDict(from_attributes=True)


class AddToCartAgentRequest(BaseModel):
    session_id: Optional[str] = None
    product_index: Optional[int] = None
    product: Optional[DiscoveredProduct] = None
    quantity: int = 1


class CheckoutConfirmRequest(BaseModel):
    session_id: Optional[str] = None
    shipping_address: Optional[Dict[str, Any]] = None
    coupon_code: Optional[str] = None
    payment_provider: str = "mock"


class CheckoutConfirmResponse(BaseModel):
    success: bool = True
    order_id: str
    confirmation_token: str
    subtotal: float
    shipping_amount: float
    estimated_tax: float
    discount_amount: float
    total_amount: float
    currency: str
    delivery_estimate: str
    is_simulation: bool = True
    items: List[Dict[str, Any]] = []
    message: str

    model_config = ConfigDict(from_attributes=True)


class PaymentConfirmRequest(BaseModel):
    order_id: str
    confirmation_token: str
    provider: str = "mock"


class PaymentConfirmResponse(BaseModel):
    success: bool = True
    status: str = "simulated_paid"
    order_id: str
    amount: float
    currency: str
    is_simulation: bool = True
    message: str
    transaction_id: str

    model_config = ConfigDict(from_attributes=True)


class ShoppingAnalyticsSummary(BaseModel):
    total_ai_searches: int
    top_countries: List[Dict[str, Any]]
    popular_categories: List[Dict[str, Any]]
    tool_success_rate: float
    avg_search_latency_ms: float
    provider_usage: Dict[str, int]
    estimated_ai_cost: float
    conversion_to_cart_rate: float
    conversion_to_checkout_rate: float
    simulated_payment_count: int

    model_config = ConfigDict(from_attributes=True)
