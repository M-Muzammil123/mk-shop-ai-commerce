from typing import List, Optional, Tuple
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.product import Product, Category, ProductImage, Inventory, ProductStatus
from app.models.interaction import Review
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate


class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryCreate]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.slug == slug).first()

    def get_roots(self) -> List[Category]:
        return self.db.query(Category).filter(Category.parent_id == None).all()


class ProductRepository(BaseRepository[Product, ProductCreate, ProductUpdate]):
    def __init__(self, db: Session):
        super().__init__(Product, db)

    def get_by_slug(self, slug: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.slug == slug).first()

    def get_catalog(
        self,
        *,
        skip: int = 0,
        limit: int = 12,
        search: Optional[str] = None,
        category_slug: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        only_in_stock: bool = False,
        sort_by: Optional[str] = "newest", # newest, price_asc, price_desc, popular
    ) -> Tuple[List[Product], int]:
        """
        Retrieves products matching filters along with total matching count.
        """
        query = self.db.query(Product).filter(Product.status == ProductStatus.PUBLISHED.value)

        # 1. Search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_pattern),
                    Product.description.ilike(search_pattern),
                    Product.sku.ilike(search_pattern),
                )
            )

        # 2. Category filter
        if category_slug:
            category = self.db.query(Category).filter(Category.slug == category_slug).first()
            if category:
                # Include child category IDs as well
                subcategories = self.db.query(Category.id).filter(
                    or_(Category.id == category.id, Category.parent_id == category.id)
                ).subquery()
                query = query.filter(Product.category_id.in_(subcategories))

        # 3. Price filter
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # 4. Stock filter
        if only_in_stock:
            query = query.join(Inventory).filter(Inventory.quantity > 0)

        # 5. Rating filter
        if min_rating is not None:
            avg_ratings = (
                self.db.query(Review.product_id, func.avg(Review.rating).label("avg_rating"))
                .filter(Review.is_approved == True)
                .group_by(Review.product_id)
                .subquery()
            )
            query = query.outerjoin(avg_ratings, Product.id == avg_ratings.c.product_id).filter(
                or_(avg_ratings.c.avg_rating >= min_rating, min_rating == 0)
            )

        # Calculate total count before pagination
        total_count = query.count()

        # 6. Sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "popular":
            # For demonstration, sort by average rating descending
            avg_ratings = (
                self.db.query(Review.product_id, func.avg(Review.rating).label("avg_rating"))
                .filter(Review.is_approved == True)
                .group_by(Review.product_id)
                .subquery()
            )
            query = query.outerjoin(avg_ratings, Product.id == avg_ratings.c.product_id).order_by(
                func.coalesce(avg_ratings.c.avg_rating, 0).desc()
            )
        else: # newest
            query = query.order_by(Product.created_at.desc())

        products = query.offset(skip).limit(limit).all()
        return products, total_count

    def create_with_inventory(self, obj_in: ProductCreate) -> Product:
        # 1. Save product core
        db_obj = self.create(obj_in)
        
        # 2. Add default inventory
        qty = obj_in.inventory.quantity if obj_in.inventory else 0
        threshold = obj_in.inventory.low_stock_threshold if obj_in.inventory else 5
        inventory_obj = Inventory(
            product_id=db_obj.id,
            quantity=qty,
            low_stock_threshold=threshold
        )
        self.db.add(inventory_obj)
        
        # 3. Add images
        if obj_in.images:
            for idx, img in enumerate(obj_in.images):
                img_obj = ProductImage(
                    product_id=db_obj.id,
                    image_url=img.image_url,
                    is_primary=img.is_primary or (idx == 0),
                    display_order=img.display_order or idx
                )
                self.db.add(img_obj)
                
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update_product(self, db_obj: Product, obj_in: ProductUpdate) -> Product:
        # Update core attributes
        db_obj = self.update(db_obj, obj_in)
        
        # Update inventory if supplied
        if obj_in.inventory:
            inventory = db_obj.inventory
            if not inventory:
                inventory = Inventory(product_id=db_obj.id)
                self.db.add(inventory)
            if obj_in.inventory.quantity is not None:
                inventory.quantity = obj_in.inventory.quantity
            if obj_in.inventory.low_stock_threshold is not None:
                inventory.low_stock_threshold = obj_in.inventory.low_stock_threshold
                
            self.db.add(inventory)
            self.db.commit()
            
        self.db.refresh(db_obj)
        return db_obj
