from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from app.schemas.auth import AddressResponse


class CouponBase(BaseModel):
    code: str = Field(..., max_length=50)
    discount_type: str # 'percentage' or 'fixed'
    discount_value: Decimal = Field(..., gt=0)
    min_purchase_amount: Decimal = Field(0.00, ge=0)
    start_date: datetime
    end_date: datetime
    usage_limit: Optional[int] = None
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class CouponResponse(CouponBase):
    id: UUID
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: UUID
    order_id: UUID
    product_id: Optional[UUID]
    quantity: int
    price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    provider: str
    transaction_id: Optional[str] = None
    amount: Decimal
    status: str = "pending"


class PaymentResponse(PaymentBase):
    id: UUID
    order_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    shipping_address_id: Optional[UUID] = None
    billing_address_id: Optional[UUID] = None
    coupon_code: Optional[str] = None
    payment_provider: str = "stripe" # 'stripe', 'paypal', 'razorpay', 'cod'


class OrderResponse(BaseModel):
    id: UUID
    profile_id: Optional[UUID]
    status: str
    total_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    coupon_id: Optional[UUID]
    shipping_address_id: Optional[UUID]
    billing_address_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None
    shipping_address: Optional[AddressResponse] = None
    billing_address: Optional[AddressResponse] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
