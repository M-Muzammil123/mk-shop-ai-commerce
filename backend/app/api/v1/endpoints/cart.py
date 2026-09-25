from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.cart import (
    CartResponse, CartItemCreate, CartItemUpdate, CartItemResponse,
    WishlistResponse, WishlistCreate
)
from app.repositories.interaction import CartRepository, WishlistRepository
from app.dependencies.auth import get_current_user
from app.models.profile import Profile
from uuid import UUID
from typing import List
from decimal import Decimal

router = APIRouter()

# --- Shopping Cart Endpoints ---

@router.get("", response_model=CartResponse)
def get_cart(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves the current authenticated user's cart and calculates totals.
    """
    cart_repo = CartRepository(db)
    cart = cart_repo.get_by_user(current_user.id)
    
    # Calculate virtual properties for the schema
    total_items = sum(item.quantity for item in cart.items)
    subtotal = Decimal(0.00)
    for item in cart.items:
        if item.product:
            subtotal += Decimal(item.product.price) * item.quantity
            
    # Set custom schema values on object
    cart.total_items = total_items
    cart.subtotal = subtotal
    return cart

@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    req: CartItemCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a product item to the shopping cart.
    """
    cart_repo = CartRepository(db)
    return cart_repo.add_item(
        user_id=current_user.id,
        product_id=req.product_id,
        quantity=req.quantity
    )

@router.put("/items/{product_id}", response_model=CartItemResponse)
def update_cart_item(
    product_id: UUID,
    req: CartItemUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the quantity of a specific cart item.
    """
    cart_repo = CartRepository(db)
    item = cart_repo.update_item_quantity(
        user_id=current_user.id,
        product_id=product_id,
        quantity=req.quantity
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found in cart")
    return item

@router.delete("/items/{product_id}", status_code=status.HTTP_200_OK)
def remove_cart_item(
    product_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes a product from the shopping cart.
    """
    cart_repo = CartRepository(db)
    success = cart_repo.remove_item(user_id=current_user.id, product_id=product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found in cart")
    return {"success": True, "message": "Item removed from cart"}

@router.post("/clear", status_code=status.HTTP_200_OK)
def clear_cart(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Empties all items from the user's cart.
    """
    cart_repo = CartRepository(db)
    cart_repo.clear_cart(current_user.id)
    return {"success": True, "message": "Cart cleared"}


# --- Wishlist Endpoints ---

@router.get("/wishlist", response_model=List[WishlistResponse])
def get_wishlist(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves the user's wishlist items.
    """
    wishlist_repo = WishlistRepository(db)
    return wishlist_repo.get_user_wishlist(current_user.id)

@router.post("/wishlist", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    req: WishlistCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a product to the user's wishlist.
    """
    wishlist_repo = WishlistRepository(db)
    return wishlist_repo.add_to_wishlist(user_id=current_user.id, product_id=req.product_id)

@router.delete("/wishlist/{product_id}", status_code=status.HTTP_200_OK)
def remove_from_wishlist(
    product_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes a product from the user's wishlist.
    """
    wishlist_repo = WishlistRepository(db)
    success = wishlist_repo.remove_from_wishlist(user_id=current_user.id, product_id=product_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found in wishlist")
    return {"success": True, "message": "Product removed from wishlist"}
