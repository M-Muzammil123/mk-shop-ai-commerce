from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.order import OrderResponse, OrderCreate, OrderStatusUpdate, CouponResponse, CouponCreate
from app.repositories.order import OrderRepository, CouponRepository
from app.repositories.interaction import CartRepository
from app.services.payment import PaymentService
from app.dependencies.auth import get_current_user, get_current_admin
from app.models.profile import Profile, UserRole
from app.models.order import OrderStatus
from uuid import UUID
from typing import List, Optional

router = APIRouter()

@router.get("", response_model=List[OrderResponse])
def get_orders(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns order history. Customers see their own orders; Admins see all orders.
    """
    order_repo = OrderRepository(db)
    if current_user.role == UserRole.ADMIN.value:
        return order_repo.get_multi()
    return order_repo.get_user_orders(current_user.id)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: UUID, 
    current_user: Profile = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Retrieves detailed order information.
    """
    order_repo = OrderRepository(db)
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    # Security check: Customer can only view their own order
    if current_user.role != UserRole.ADMIN.value and order.profile_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return order

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    req: OrderCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checks out the user's shopping cart and places a new order.
    Validates stock availability, applies discounts, locks items, and processes the mock payment.
    """
    cart_repo = CartRepository(db)
    order_repo = OrderRepository(db)
    coupon_repo = CouponRepository(db)
    payment_service = PaymentService(db)

    # 1. Fetch user's cart
    cart = cart_repo.get_by_user(current_user.id)
    if not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shopping cart is empty")

    # 2. Map items and check availability
    order_items = []
    for item in cart.items:
        if not item.product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product in cart")
        order_items.append((item.product_id, item.quantity, item.product.price))

    # 3. Lookup Coupon
    coupon = None
    if req.coupon_code:
        coupon = coupon_repo.get_by_code(req.coupon_code)
        if not coupon:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired coupon")

    # 4. Create Order (handles transaction, stock deduction, and coupon usage tracking)
    try:
        order = order_repo.create_order_with_items(
            profile_id=current_user.id,
            items=order_items,
            shipping_address_id=req.shipping_address_id,
            billing_address_id=req.billing_address_id,
            coupon=coupon
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # 5. Route to Payment Adapter
    try:
        payment_service.process_checkout_payment(
            order_id=order.id,
            amount=order.total_amount,
            provider=req.payment_provider
        )
    except Exception as e:
        # In case of payment process routing failure, transaction rollback isn't absolute, but record payment status as failed
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment processing failed: {str(e)}")

    # 6. Clear shopping cart upon checkout completion
    cart_repo.clear_cart(current_user.id)

    # Refresh DB session to return updated relationships
    db.refresh(order)
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: UUID,
    req: OrderStatusUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Updates status of an order. Restricted to Admins.
    """
    order_repo = OrderRepository(db)
    try:
        status_enum = OrderStatus(req.status.lower())
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported order status: {req.status}")
        
    order = order_repo.update_order_status(order_id, status_enum)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


# --- Coupon Endpoints (Admin Controlled) ---

@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    req: CouponCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Creates a discount coupon. Restricted to Admins.
    """
    coupon_repo = CouponRepository(db)
    existing = coupon_repo.get_by_code(req.code)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon code already exists")
    return coupon_repo.create(req)

@router.get("/coupons/{code}", response_model=CouponResponse)
def get_coupon_by_code(code: str, db: Session = Depends(get_db)):
    """
    Verifies and retrieves coupon discount details.
    """
    coupon_repo = CouponRepository(db)
    coupon = coupon_repo.get_by_code(code)
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon code not found or inactive")
    return coupon
