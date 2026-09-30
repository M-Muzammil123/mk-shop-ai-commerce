from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.product import (
    ProductResponse, ProductCreate, ProductUpdate, 
    CategoryResponse, CategoryCreate, PaginatedProductResponse
)
from app.repositories.product import ProductRepository, CategoryRepository
from app.dependencies.auth import get_current_admin
from uuid import UUID
from typing import List, Optional
 
router = APIRouter()
 
@router.get("", response_model=PaginatedProductResponse)
def get_products(
    skip: int = 0,
    limit: int = 12,
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock: bool = False,
    sort_by: Optional[str] = "newest",
    db: Session = Depends(get_db)
):
    """
    Returns pagination-filtered catalog list of products.
    """
    prod_repo = ProductRepository(db)
    products, total = prod_repo.get_catalog(
        skip=skip,
        limit=limit,
        search=search,
        category_slug=category,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        only_in_stock=in_stock,
        sort_by=sort_by
    )
    return {
        "success": True,
        "total": total,
        "skip": skip,
        "limit": limit,
        "products": products
    }

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Lists all categories.
    """
    cat_repo = CategoryRepository(db)
    return cat_repo.get_multi()

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    req: CategoryCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Creates a new category. Restricted to Admins.
    """
    cat_repo = CategoryRepository(db)
    existing = cat_repo.get_by_slug(req.slug)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category slug already exists")
    return cat_repo.create(req)

@router.get("/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    """
    Retrieves individual product details by slug or UUID.
    """
    prod_repo = ProductRepository(db)
    product = None
    try:
        val_uuid = UUID(slug)
        product = prod_repo.get(val_uuid)
    except (ValueError, TypeError):
        pass
    if not product:
        product = prod_repo.get_by_slug(slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    req: ProductCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Creates a new product with inventory levels. Restricted to Admins.
    """
    prod_repo = ProductRepository(db)
    existing = prod_repo.get_by_slug(req.slug)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product slug already exists")
    return prod_repo.create_with_inventory(req)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    req: ProductUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Updates an existing product's fields or inventory. Restricted to Admins.
    """
    prod_repo = ProductRepository(db)
    product = prod_repo.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return prod_repo.update_product(product, req)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: UUID,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Deletes a product from the database. Restricted to Admins.
    """
    prod_repo = ProductRepository(db)
    product = prod_repo.get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    prod_repo.remove(product_id)
    return {"success": True, "message": "Product deleted successfully"}
