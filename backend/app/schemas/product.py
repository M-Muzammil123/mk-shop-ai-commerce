from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal
from uuid import UUID
from datetime import datetime


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductImageBase(BaseModel):
    image_url: str
    is_primary: bool = False
    display_order: int = 0


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageResponse(ProductImageBase):
    id: UUID
    product_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class InventoryBase(BaseModel):
    quantity: int = Field(0, ge=0)
    low_stock_threshold: int = Field(5, ge=0)


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    id: UUID
    product_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    sku: str = Field(..., max_length=100)
    status: str = "draft"
    is_featured: bool = False
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    inventory: Optional[InventoryBase] = None
    images: Optional[List[ProductImageCreate]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    compare_at_price: Optional[Decimal] = Field(None, gt=0)
    sku: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    category_id: Optional[int] = None
    inventory: Optional[InventoryUpdate] = None


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []
    inventory: Optional[InventoryResponse] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class PaginatedProductResponse(BaseModel):
    success: bool
    total: int
    skip: int
    limit: int
    products: List[ProductResponse]

