from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.cart import ReviewResponse, ReviewCreate
from app.repositories.interaction import ReviewRepository
from app.dependencies.auth import get_current_user, get_current_admin
from app.models.profile import Profile, UserRole
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_reviews_by_product(product_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves approved reviews and ratings for a product.
    """
    review_repo = ReviewRepository(db)
    return review_repo.get_product_reviews(product_id)

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    req: ReviewCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a rating and review for a product. Automatically approved by default.
    """
    review_repo = ReviewRepository(db)
    
    # Check if review already exists
    existing = db.query(review_repo.model).filter(
        review_repo.model.profile_id == current_user.id,
        review_repo.model.product_id == req.product_id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already reviewed this product")

    # Map request to DB object
    db_obj = review_repo.model(
        profile_id=current_user.id,
        product_id=req.product_id,
        rating=req.rating,
        title=req.title,
        comment=req.comment,
        is_approved=True # Auto-approve for demo simplicity
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: UUID,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approves a submitted product review. Restricted to Admins.
    """
    review_repo = ReviewRepository(db)
    review = review_repo.get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        
    review.is_approved = True
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}", status_code=status.HTTP_200_OK)
def delete_review(
    review_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a review. Restricted to the authoring user or Admins.
    """
    review_repo = ReviewRepository(db)
    review = review_repo.get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        
    if current_user.role != UserRole.ADMIN.value and review.profile_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    review_repo.remove(review_id)
    return {"success": True, "message": "Review deleted successfully"}
