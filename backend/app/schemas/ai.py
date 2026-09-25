from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from uuid import UUID
from decimal import Decimal


class ParsedQueryIntent(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    ram: Optional[str] = None
    use_case: Optional[str] = None
    preferences: List[str] = []
    exclusions: List[str] = []
    sort_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductMatchItem(BaseModel):
    id: UUID
    name: str
    slug: str
    price: float
    compare_at_price: Optional[float] = None
    is_featured: bool
    status: str
    images: List[Dict[str, Any]] = []
    match_score: int = 95
    match_reasons: List[str] = []
    attributes: Dict[str, Any] = {}
    specifications: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)


class AISearchResponse(BaseModel):
    success: bool = True
    query: str
    parsed_intent: ParsedQueryIntent
    summary: str
    total_matches: int
    products: List[ProductMatchItem]
    suggestions: List[str] = []
    latency_ms: int = 42

    model_config = ConfigDict(from_attributes=True)


class AISearchRequest(BaseModel):
    query: str
    mode: Optional[str] = "ai"  # quick, ai, deep, compare, recommendations
    session_id: Optional[str] = None


class ConversationalSearchRequest(BaseModel):
    message: str
    session_id: str
    reset: bool = False


class ConversationalSearchResponse(BaseModel):
    success: bool = True
    session_id: str
    reply: str
    parsed_intent: ParsedQueryIntent
    products: List[ProductMatchItem]
    history: List[Dict[str, str]]

    model_config = ConfigDict(from_attributes=True)


class ProductCompareRequest(BaseModel):
    product_ids: List[UUID]


class SpecComparisonRow(BaseModel):
    feature: str
    values: Dict[str, str]  # product_id -> spec_value


class ProductCompareResponse(BaseModel):
    success: bool = True
    products: List[ProductMatchItem]
    spec_table: List[SpecComparisonRow]
    best_overall_id: Optional[UUID] = None
    best_value_id: Optional[UUID] = None
    best_performance_id: Optional[UUID] = None
    ai_summary: str

    model_config = ConfigDict(from_attributes=True)


class ProductAIInsightResponse(BaseModel):
    product_id: UUID
    why_this_product: List[str]
    best_for: str
    potential_downside: str
    match_score: int = 90

    model_config = ConfigDict(from_attributes=True)


class ReviewIntelligenceResponse(BaseModel):
    product_id: UUID
    overall_sentiment: str
    positive_percentage: int
    customers_love: List[str]
    common_complaints: List[str]
    total_reviews_analyzed: int

    model_config = ConfigDict(from_attributes=True)


class CartAssistantRequest(BaseModel):
    prompt: Optional[str] = None
    target_budget: Optional[float] = None


class CartAssistantResponse(BaseModel):
    success: bool = True
    current_total: float
    suggested_total: float
    potential_savings: float
    recommendation_type: str  # "budget_optimize", "bundle_builder", "upgrade"
    ai_advice: str
    suggested_changes: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)


class ShoppingAgentRequest(BaseModel):
    user_prompt: str


class AgentStep(BaseModel):
    step: str
    status: str  # "completed", "analyzing", "evaluating"
    detail: str


class ShoppingAgentResponse(BaseModel):
    success: bool = True
    reasoning_steps: List[AgentStep]
    final_recommendation: ProductMatchItem
    explanation: str

    model_config = ConfigDict(from_attributes=True)


class AISearchAnalyticsSummary(BaseModel):
    total_searches: int
    avg_latency_ms: float
    zero_result_searches_count: int
    click_through_rate: float
    search_to_cart_rate: float
    top_queries: List[Dict[str, Any]]
    zero_result_queries: List[str]
