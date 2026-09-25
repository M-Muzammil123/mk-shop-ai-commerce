from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.database.session import get_db
from app.dependencies.auth import get_current_user, get_optional_current_user
from app.models.profile import Profile
from app.schemas.ai import (
    AISearchRequest, AISearchResponse,
    ConversationalSearchRequest, ConversationalSearchResponse,
    ProductCompareRequest, ProductCompareResponse,
    ProductAIInsightResponse, ReviewIntelligenceResponse,
    CartAssistantRequest, CartAssistantResponse,
    ShoppingAgentRequest, ShoppingAgentResponse
)
from app.services.ai.ai_search_service import AISearchService
from app.services.ai.conversational_search_service import ConversationalSearchService
from app.services.ai.product_intelligence_service import ProductIntelligenceService
from app.services.ai.review_intelligence_service import ReviewIntelligenceService
from app.services.ai.ai_cart_assistant_service import AICartAssistantService
from app.services.ai.ai_shopping_agent_service import AIShoppingAgentService

router = APIRouter()


@router.post("/search", response_model=AISearchResponse)
def execute_ai_search(
    req: AISearchRequest,
    db: Session = Depends(get_db)
):
    """
    Natural-language AI & Hybrid search endpoint.
    Parses intent, searches products, applies constraints, and returns match scores and reasons.
    """
    search_service = AISearchService(db)
    return search_service.execute_hybrid_search(req.query, session_id=req.session_id)


@router.post("/conversational-search", response_model=ConversationalSearchResponse)
def execute_conversational_search(
    req: ConversationalSearchRequest,
    user: Optional[Profile] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Multi-turn conversational search endpoint. Maintains context across sequential user queries.
    """
    conv_service = ConversationalSearchService(db)
    user_id = user.id if user else None
    return conv_service.process_message(
        session_id=req.session_id,
        message=req.message,
        profile_id=user_id,
        reset=req.reset
    )


@router.post("/compare", response_model=ProductCompareResponse)
def compare_products(
    req: ProductCompareRequest,
    db: Session = Depends(get_db)
):
    """
    Side-by-side spec comparison matrix with AI badges (BEST OVERALL, BEST VALUE, BEST PERFORMANCE).
    """
    if not req.product_ids or len(req.product_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least 2 product IDs for comparison"
        )
    intel_service = ProductIntelligenceService(db)
    return intel_service.compare_products(req.product_ids)


@router.get("/products/{product_id}/insights", response_model=ProductAIInsightResponse)
def get_product_insights(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Generates AI product insights (Why this product?, Best for, Potential downsides).
    """
    intel_service = ProductIntelligenceService(db)
    return intel_service.get_product_insights(product_id)


@router.get("/products/{product_id}/review-intelligence", response_model=ReviewIntelligenceResponse)
def get_review_intelligence(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Synthesizes overall sentiment, positive percentage, pros, and cons based on real customer reviews.
    """
    rev_service = ReviewIntelligenceService(db)
    return rev_service.get_review_intelligence(product_id)


@router.post("/cart/assistant", response_model=CartAssistantResponse)
def get_cart_assistant_suggestions(
    req: CartAssistantRequest,
    user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Cart Assistant: budget optimization and setup bundle recommendations.
    """
    cart_assistant = AICartAssistantService(db)
    return cart_assistant.optimize_cart(
        profile_id=user.id, prompt=req.prompt, target_budget=req.target_budget
    )


@router.post("/agent", response_model=ShoppingAgentResponse)
def execute_shopping_agent(
    req: ShoppingAgentRequest,
    db: Session = Depends(get_db)
):
    """
    AI Shopping Agent: multi-step reasoning query workflow.
    """
    agent_service = AIShoppingAgentService(db)
    return agent_service.execute_agent_workflow(req.user_prompt)
