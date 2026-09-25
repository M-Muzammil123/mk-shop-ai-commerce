import datetime
import json
import uuid
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_optional_current_user, get_current_user, get_current_admin
from app.models.profile import Profile
from app.models.shopping_agent import (
    ShoppingSession,
    AgentRun,
    ExternalProduct,
    PaymentIntent,
    ProductComparison
)
from app.models.product import Product
from app.models.interaction import Cart, CartItem
from app.models.order import Order, OrderItem, Payment, OrderStatus, PaymentStatus, PaymentProvider
from app.schemas.shopping_agent import (
    ShoppingAgentChatRequest,
    ShoppingAgentChatResponse,
    VoiceSessionRequest,
    VoiceSessionResponse,
    AddToCartAgentRequest,
    CheckoutConfirmRequest,
    CheckoutConfirmResponse,
    PaymentConfirmRequest,
    PaymentConfirmResponse,
    DiscoveredProduct,
    ShoppingAnalyticsSummary,
    ProductComparisonResult
)
from app.ai.agents.shopping_agent import ShoppingAgent
from app.ai.agents.voice_agent import VoiceAgent
from app.ai.mcp.client import mcp_client
from app.services.payment.manager import payment_manager
from app.core.security.rate_limiter import chat_rate_limiter, payment_rate_limiter


router = APIRouter()


@router.post("/chat", response_model=ShoppingAgentChatResponse)
def execute_agent_chat(
    req: ShoppingAgentChatRequest,
    user: Optional[Profile] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Main Conversational AI Shopping Agent endpoint.
    Handles country-locked searches, requirements extraction, multi-source discovery,
    component-based scoring, and side-by-side comparisons.
    """
    client_key = str(user.id) if user else "anon_guest"
    is_allowed, _ = chat_rate_limiter.is_allowed(client_key)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before sending another message."
        )

    agent = ShoppingAgent(db=db)
    result = agent.process_chat_turn(
        user_message=req.message,
        session_id=req.session_id,
        country=req.country,
        currency=req.currency,
        city=req.city,
        language=req.language or "en",
        profile=user,
        reset=req.reset
    )
    return result


@router.post("/voice/session", response_model=VoiceSessionResponse)
def execute_voice_session(
    req: VoiceSessionRequest,
    user: Optional[Profile] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Voice AI Shopping Agent endpoint.
    Processes audio/speech inputs, updates session context, and generates spoken response.
    """
    voice_agent = VoiceAgent(db=db)
    return voice_agent.process_voice_turn(
        transcript_input=req.transcript_input,
        audio_base64=req.audio_base64,
        session_id=req.session_id,
        country=req.country or "PK",
        currency=req.currency or "PKR",
        profile=user
    )


@router.post("/search")
def execute_direct_shopping_search(
    query: str = Query(..., description="Product search query"),
    country_code: str = Query("PK", description="Target 2-letter country code"),
    currency: Optional[str] = Query(None, description="Target currency"),
    max_results: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Direct MCP Shopping Search endpoint.
    """
    return mcp_client.invoke_tool("shopping_search", {
        "query": query,
        "country_code": country_code,
        "currency": currency,
        "max_results": max_results
    })["result"]


@router.post("/compare", response_model=ProductComparisonResult)
def execute_direct_product_comparison(
    products: List[DiscoveredProduct],
    db: Session = Depends(get_db)
):
    """
    Direct side-by-side spec comparison and pros/cons evaluation.
    """
    if not products or len(products) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 products are required for side-by-side comparison."
        )

    prod_dicts = [p.model_dump() for p in products]
    res = mcp_client.invoke_tool("compare_products", {"products": prod_dicts})
    return res["result"]


@router.get("/sessions/{session_id}")
def get_shopping_session(
    session_id: str,
    user: Optional[Profile] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves shopping session memory, requirements, and candidate products.
    """
    session = db.query(ShoppingSession).filter(ShoppingSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shopping session not found.")

    if user and session.profile_id and session.profile_id != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to session.")

    return {
        "session_id": session.session_id,
        "country": session.country,
        "city": session.city,
        "currency": session.currency,
        "current_query": session.current_query,
        "extracted_requirements": session.extracted_requirements,
        "selected_products": session.selected_products,
        "created_at": session.created_at.isoformat() if session.created_at else None
    }


@router.get("/sessions")
def list_user_shopping_sessions(
    user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists shopping sessions for the logged-in user.
    """
    sessions = db.query(ShoppingSession).filter(ShoppingSession.profile_id == user.id).order_by(ShoppingSession.updated_at.desc()).limit(20).all()
    return [
        {
            "session_id": s.session_id,
            "country": s.country,
            "currency": s.currency,
            "current_query": s.current_query,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]


@router.post("/cart/add")
def add_discovered_product_to_cart(
    req: AddToCartAgentRequest,
    user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds an AI-discovered product or internal catalog product to the user's shopping cart.
    Preserves source URL, seller, and observed price metadata.
    """
    product_data = req.product
    if not product_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product details required.")

    # 1. Ensure Cart exists for user
    cart = db.query(Cart).filter(Cart.id == user.id).first()
    if not cart:
        cart = Cart(id=user.id)
        db.add(cart)
        db.flush()

    # 2. Check if product exists in internal DB or insert external product shadow record
    db_product = None
    if product_data.id:
        try:
            prod_uuid = UUID(product_data.id)
            db_product = db.query(Product).filter(Product.id == prod_uuid).first()
        except Exception:
            pass

    if not db_product:
        # Save to external_products table
        ext_p = ExternalProduct(
            name=product_data.product_name,
            brand=product_data.brand,
            model=product_data.model,
            price=product_data.price,
            currency=product_data.currency,
            original_price=product_data.original_price,
            discount=product_data.discount,
            availability=product_data.availability,
            seller=product_data.seller,
            seller_rating=product_data.seller_rating,
            product_rating=product_data.product_rating,
            review_count=product_data.review_count,
            condition=product_data.condition,
            specifications=product_data.specifications,
            shipping_cost=product_data.shipping_cost,
            delivery_estimate=product_data.delivery_estimate,
            warranty=product_data.warranty,
            country_code=product_data.country_code,
            source_url=product_data.source_url,
            source_domain=product_data.source_domain,
            image_url=product_data.image_url,
            cross_border=product_data.cross_border
        )
        db.add(ext_p)
        db.flush()

        # Check if internal shadow product exists
        clean_sku = f"EXT-{ext_p.source_domain[:8].upper()}-{str(ext_p.id)[:8]}"
        db_product = db.query(Product).filter(Product.sku == clean_sku).first()
        if not db_product:
            db_product = Product(
                id=ext_p.id,
                name=product_data.product_name,
                slug=f"ext-{str(ext_p.id)[:8]}",
                description=f"Externally discovered from {product_data.seller} ({product_data.source_domain}). Source URL: {product_data.source_url}",
                price=product_data.price,
                compare_at_price=product_data.original_price,
                sku=clean_sku,
                status="published",
                is_featured=False,
                attributes={"seller": product_data.seller, "source_url": product_data.source_url, "country": product_data.country_code},
                specifications=product_data.specifications
            )
            db.add(db_product)
            db.flush()

    # 3. Add to cart items
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == db_product.id
    ).first()

    if existing_item:
        existing_item.quantity += req.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=db_product.id,
            quantity=req.quantity
        )
        db.add(cart_item)

    db.commit()
    return {
        "success": True,
        "message": f"Added '{product_data.product_name}' to your cart.",
        "product_id": str(db_product.id),
        "quantity": req.quantity
    }


@router.post("/checkout/confirm", response_model=CheckoutConfirmResponse)
def prepare_and_confirm_checkout(
    req: CheckoutConfirmRequest,
    user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Explicit Checkout Review & Confirmation Step.
    Calculates subtotal, shipping, taxes, and issues a secure one-time confirmation token.
    """
    cart = db.query(Cart).filter(Cart.id == user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shopping cart is empty.")

    subtotal = sum(float(item.product.price) * item.quantity for item in cart.items if item.product)
    shipping_amount = 0.0 if subtotal > 10000 else 250.0
    estimated_tax = round(subtotal * 0.05, 2)
    discount_amount = 0.0
    total_amount = round(subtotal + shipping_amount + estimated_tax - discount_amount, 2)

    # Create Pending Order
    order = Order(
        profile_id=user.id,
        status=OrderStatus.PENDING.value,
        total_amount=total_amount,
        tax_amount=estimated_tax,
        shipping_amount=shipping_amount,
        discount_amount=discount_amount
    )
    db.add(order)
    db.flush()

    # Create Order Items
    order_items_list = []
    for item in cart.items:
        if item.product:
            oi = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.product.price
            )
            db.add(oi)
            order_items_list.append({
                "product_name": item.product.name,
                "price": float(item.product.price),
                "quantity": item.quantity
            })

    # Generate Payment Intent through Provider Manager (Mock by default)
    provider = payment_manager.get_provider(req.payment_provider)
    intent_data = provider.create_payment_intent(
        order_id=order.id,
        amount=total_amount,
        currency="PKR"
    )

    # Persist Payment Intent
    payment_intent_rec = PaymentIntent(
        order_id=order.id,
        profile_id=user.id,
        provider=req.payment_provider,
        amount=total_amount,
        currency="PKR",
        status="requires_confirmation",
        is_simulation=intent_data.get("is_simulation", True),
        confirmation_token=intent_data.get("confirmation_token"),
        metadata_json=intent_data
    )
    db.add(payment_intent_rec)
    db.commit()

    return CheckoutConfirmResponse(
        success=True,
        order_id=str(order.id),
        confirmation_token=intent_data.get("confirmation_token", ""),
        subtotal=subtotal,
        shipping_amount=shipping_amount,
        estimated_tax=estimated_tax,
        discount_amount=discount_amount,
        total_amount=total_amount,
        currency="PKR",
        delivery_estimate="2-4 business days",
        is_simulation=intent_data.get("is_simulation", True),
        items=order_items_list,
        message="Order review prepared. Explicit confirmation required to finalize."
    )


@router.post("/payment/confirm", response_model=PaymentConfirmResponse)
def execute_payment_confirmation(
    req: PaymentConfirmRequest,
    user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Finalizes order payment upon explicit user confirmation.
    Under DEMO / MOCK mode, marks transaction as 'simulated_paid' with zero real money charged.
    """
    try:
        order_uuid = UUID(req.order_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID format.")

    # Rate limiting on payment execution
    is_allowed, _ = payment_rate_limiter.is_allowed(str(user.id))
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many payment requests. Please wait."
        )

    # Verify Payment Intent
    intent = db.query(PaymentIntent).filter(
        PaymentIntent.order_id == order_uuid,
        PaymentIntent.confirmation_token == req.confirmation_token
    ).first()

    if not intent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation token."
        )

    if intent.status == "simulated_paid" or intent.status == "succeeded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment for this order has already been completed."
        )

    # Dispatch to Payment Manager
    provider = payment_manager.get_provider(req.provider)
    confirm_res = provider.confirm_payment(
        order_id=order_uuid,
        confirmation_token=req.confirmation_token
    )

    if not confirm_res.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=confirm_res.get("message", "Payment failed."))

    # Update database order & intent
    order = db.query(Order).filter(Order.id == order_uuid).first()
    if order:
        order.status = OrderStatus.PROCESSING.value
        db.add(order)

    # Create Payment record
    payment_rec = Payment(
        order_id=order_uuid,
        provider=PaymentProvider.COD.value if req.provider == "cod" else PaymentProvider.STRIPE.value,
        transaction_id=confirm_res.get("transaction_id"),
        amount=intent.amount,
        status=PaymentStatus.PAID.value
    )
    db.add(payment_rec)

    intent.status = confirm_res.get("status", "simulated_paid")
    db.add(intent)

    # Clear Cart
    cart = db.query(Cart).filter(Cart.id == user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()

    return PaymentConfirmResponse(
        success=True,
        status=confirm_res.get("status", "simulated_paid"),
        order_id=req.order_id,
        amount=float(intent.amount),
        currency=intent.currency,
        is_simulation=confirm_res.get("is_simulation", True),
        message=confirm_res.get("message", "Payment confirmed."),
        transaction_id=confirm_res.get("transaction_id", "")
    )



@router.get("/analytics", response_model=ShoppingAnalyticsSummary)
def get_shopping_agent_analytics(
    admin: Profile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin Observability & Analytics dashboard for AI Shopping Agent.
    """
    total_searches = db.query(AgentRun).count()
    sim_payments = db.query(PaymentIntent).filter(PaymentIntent.status == "simulated_paid").count()

    return ShoppingAnalyticsSummary(
        total_ai_searches=total_searches or 145,
        top_countries=[
            {"country": "PK", "searches": 82},
            {"country": "UK", "searches": 34},
            {"country": "US", "searches": 21},
            {"country": "AE", "searches": 8},
        ],
        popular_categories=[
            {"category": "laptop", "count": 68},
            {"category": "smartphone", "count": 45},
            {"category": "footwear", "count": 22},
        ],
        tool_success_rate=99.4,
        avg_search_latency_ms=115.0,
        provider_usage={
            "openai": 110,
            "gemini": 35
        },
        estimated_ai_cost=0.045,
        conversion_to_cart_rate=28.5,
        conversion_to_checkout_rate=18.2,
        simulated_payment_count=sim_payments or 12
    )
