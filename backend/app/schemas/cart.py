from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from app.schemas.product import ProductResponse


class CartItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(1, ge=1)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: UUID
    cart_id: UUID
    product_id: UUID
    quantity: int
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime
    items: List[CartItemResponse] = []
    total_items: int = 0
    subtotal: Decimal = Decimal(0.00)

    class Config:
        from_attributes = True


class WishlistCreate(BaseModel):
    product_id: UUID


class WishlistResponse(BaseModel):
    id: UUID
    profile_id: UUID
    product_id: UUID
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=150)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    product_id: UUID


class ReviewResponse(ReviewBase):
    id: UUID
    profile_id: UUID
    product_id: UUID
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str


class NotificationCreate(NotificationBase):
    profile_id: UUID


class NotificationResponse(NotificationBase):
    id: UUID
    profile_id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    id: UUID
    profile_id: Optional[UUID]
    action: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsCard(BaseModel):
    value: Decimal
    change_percentage: Decimal
    label: str


class SalesChartPoint(BaseModel):
    date: str
    revenue: Decimal
    orders_count: int


class DashboardAnalytics(BaseModel):
    revenue_card: AnalyticsCard
    orders_card: AnalyticsCard
    products_card: AnalyticsCard
    customers_card: AnalyticsCard
    sales_chart: List[SalesChartPoint] = []
    recent_orders: List[Dict[str, Any]] = []
    best_sellers: List[Dict[str, Any]] = []
