from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.product import Product, ProductStatus
from app.models.interaction import RecentlyViewed, Review
from app.repositories.product import ProductRepository
from app.repositories.interaction import RecentlyViewedRepository
from uuid import UUID


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.rv_repo = RecentlyViewedRepository(db)

    def get_similar_products(self, product_id: UUID, limit: int = 4) -> List[Product]:
        """
        AI Content-filtering recommendation.
        Finds products in the same category, excluding itself,
        ordered by rating and creation date.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return []

        # Find products in the same category
        query = (
            self.db.query(Product)
            .filter(
                Product.status == ProductStatus.PUBLISHED.value,
                Product.id != product_id,
            )
        )
        
        if product.category_id:
            query = query.filter(Product.category_id == product.category_id)

        # Join reviews to sort by popularity/rating
        avg_ratings = (
            self.db.query(Review.product_id, func.avg(Review.rating).label("avg_rating"))
            .filter(Review.is_approved == True)
            .group_by(Review.product_id)
            .subquery()
        )

        similar_products = (
            query.outerjoin(avg_ratings, Product.id == avg_ratings.c.product_id)
            .order_by(func.coalesce(avg_ratings.c.avg_rating, 0).desc(), Product.created_at.desc())
            .limit(limit)
            .all()
        )

        # Fallback if no matching category items found
        if not similar_products:
            similar_products = (
                self.db.query(Product)
                .filter(
                    Product.status == ProductStatus.PUBLISHED.value,
                    Product.id != product_id
                )
                .limit(limit)
                .all()
            )

        return similar_products

    def get_user_recommendations(self, user_id: UUID, limit: int = 4) -> List[Product]:
        """
        Collaborative & content recommendation.
        Fetches categories user has viewed recently and recommends highly rated
        products in those categories that they haven't viewed recently.
        """
        history = self.rv_repo.get_user_history(user_id, limit=5)
        if not history:
            # Fallback to featured products or popular items
            return (
                self.db.query(Product)
                .filter(Product.status == ProductStatus.PUBLISHED.value)
                .order_by(Product.is_featured.desc(), Product.created_at.desc())
                .limit(limit)
                .all()
            )

        viewed_product_ids = [h.product_id for h in history]
        viewed_products = (
            self.db.query(Product.category_id)
            .filter(Product.id.in_(viewed_product_ids))
            .all()
        )
        category_ids = list(set([p.category_id for p in viewed_products if p.category_id is not None]))

        if not category_ids:
            # Fallback if no category tags
            return (
                self.db.query(Product)
                .filter(
                    Product.status == ProductStatus.PUBLISHED.value,
                    ~Product.id.in_(viewed_product_ids)
                )
                .limit(limit)
                .all()
            )

        # Recommends products in those categories, excluding already viewed items
        query = (
            self.db.query(Product)
            .filter(
                Product.status == ProductStatus.PUBLISHED.value,
                Product.category_id.in_(category_ids),
                ~Product.id.in_(viewed_product_ids),
            )
        )

        avg_ratings = (
            self.db.query(Review.product_id, func.avg(Review.rating).label("avg_rating"))
            .filter(Review.is_approved == True)
            .group_by(Review.product_id)
            .subquery()
        )

        recommendations = (
            query.outerjoin(avg_ratings, Product.id == avg_ratings.c.product_id)
            .order_by(func.coalesce(avg_ratings.c.avg_rating, 0).desc())
            .limit(limit)
            .all()
        )

        # If not enough recommendations, pad with featured items
        if len(recommendations) < limit:
            remaining = limit - len(recommendations)
            exclude_ids = viewed_product_ids + [r.id for r in recommendations]
            pad_items = (
                self.db.query(Product)
                .filter(
                    Product.status == ProductStatus.PUBLISHED.value,
                    ~Product.id.in_(exclude_ids)
                )
                .order_by(Product.is_featured.desc())
                .limit(remaining)
                .all()
            )
            recommendations.extend(pad_items)

        return recommendations
