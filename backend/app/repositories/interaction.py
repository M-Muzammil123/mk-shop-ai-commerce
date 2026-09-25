from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base import BaseRepository
from app.models.interaction import Cart, CartItem, Wishlist, Review, Notification, ActivityLog, RecentlyViewed
from app.models.product import Product
from uuid import UUID
from datetime import datetime


class CartRepository(BaseRepository[Cart, Cart, Cart]):
    def __init__(self, db: Session):
        super().__init__(Cart, db)

    def get_by_user(self, user_id: UUID) -> Cart:
        """
        Retrieves user's cart. If not exists, creates it (fallback).
        """
        cart = self.db.query(Cart).filter(Cart.id == user_id).first()
        if not cart:
            cart = Cart(id=user_id)
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        return cart

    def add_item(self, user_id: UUID, product_id: UUID, quantity: int = 1) -> CartItem:
        cart = self.get_by_user(user_id)
        
        # Check if item already exists in cart
        cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            
        self.db.add(cart_item)
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item

    def update_item_quantity(self, user_id: UUID, product_id: UUID, quantity: int) -> Optional[CartItem]:
        cart = self.get_by_user(user_id)
        cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )
        if cart_item:
            cart_item.quantity = quantity
            self.db.add(cart_item)
            self.db.commit()
            self.db.refresh(cart_item)
        return cart_item

    def remove_item(self, user_id: UUID, product_id: UUID) -> bool:
        cart = self.get_by_user(user_id)
        cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )
        if cart_item:
            self.db.delete(cart_item)
            self.db.commit()
            return True
        return False

    def clear_cart(self, user_id: UUID) -> None:
        cart = self.get_by_user(user_id)
        self.db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        self.db.commit()


class WishlistRepository(BaseRepository[Wishlist, Wishlist, Wishlist]):
    def __init__(self, db: Session):
        super().__init__(Wishlist, db)

    def get_user_wishlist(self, user_id: UUID) -> List[Wishlist]:
        return (
            self.db.query(Wishlist)
            .filter(Wishlist.profile_id == user_id)
            .order_by(Wishlist.created_at.desc())
            .all()
        )

    def add_to_wishlist(self, user_id: UUID, product_id: UUID) -> Wishlist:
        wishlist_item = (
            self.db.query(Wishlist)
            .filter(Wishlist.profile_id == user_id, Wishlist.product_id == product_id)
            .first()
        )
        if not wishlist_item:
            wishlist_item = Wishlist(profile_id=user_id, product_id=product_id)
            self.db.add(wishlist_item)
            self.db.commit()
            self.db.refresh(wishlist_item)
        return wishlist_item

    def remove_from_wishlist(self, user_id: UUID, product_id: UUID) -> bool:
        wishlist_item = (
            self.db.query(Wishlist)
            .filter(Wishlist.profile_id == user_id, Wishlist.product_id == product_id)
            .first()
        )
        if wishlist_item:
            self.db.delete(wishlist_item)
            self.db.commit()
            return True
        return False


class ReviewRepository(BaseRepository[Review, Review, Review]):
    def __init__(self, db: Session):
        super().__init__(Review, db)

    def get_product_reviews(self, product_id: UUID) -> List[Review]:
        return (
            self.db.query(Review)
            .filter(Review.product_id == product_id, Review.is_approved == True)
            .order_by(Review.created_at.desc())
            .all()
        )

    def get_rating_summary(self, product_id: UUID) -> Tuple[float, int]:
        summary = (
            self.db.query(func.avg(Review.rating), func.count(Review.id))
            .filter(Review.product_id == product_id, Review.is_approved == True)
            .first()
        )
        avg_rating = float(summary[0]) if summary and summary[0] is not None else 0.0
        count = int(summary[1]) if summary and summary[1] is not None else 0
        return avg_rating, count


class NotificationRepository(BaseRepository[Notification, Notification, Notification]):
    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def get_user_notifications(self, user_id: UUID, unread_only: bool = False) -> List[Notification]:
        query = self.db.query(Notification).filter(Notification.profile_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).all()

    def mark_all_read(self, user_id: UUID) -> None:
        self.db.query(Notification).filter(
            Notification.profile_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True}, synchronize_session=False)
        self.db.commit()


class ActivityLogRepository(BaseRepository[ActivityLog, ActivityLog, ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def log_activity(self, user_id: Optional[UUID], action: str, details: Optional[Dict[str, Any]] = None) -> ActivityLog:
        log = ActivityLog(profile_id=user_id, action=action, details=details)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log


class RecentlyViewedRepository(BaseRepository[RecentlyViewed, RecentlyViewed, RecentlyViewed]):
    def __init__(self, db: Session):
        super().__init__(RecentlyViewed, db)

    def get_user_history(self, user_id: UUID, limit: int = 10) -> List[RecentlyViewed]:
        return (
            self.db.query(RecentlyViewed)
            .filter(RecentlyViewed.profile_id == user_id)
            .order_by(RecentlyViewed.viewed_at.desc())
            .limit(limit)
            .all()
        )

    def record_view(self, user_id: UUID, product_id: UUID) -> RecentlyViewed:
        view = (
            self.db.query(RecentlyViewed)
            .filter(RecentlyViewed.profile_id == user_id, RecentlyViewed.product_id == product_id)
            .first()
        )
        if view:
            view.viewed_at = datetime.utcnow()
        else:
            view = RecentlyViewed(profile_id=user_id, product_id=product_id)
            
        self.db.add(view)
        self.db.commit()
        self.db.refresh(view)
        return view
