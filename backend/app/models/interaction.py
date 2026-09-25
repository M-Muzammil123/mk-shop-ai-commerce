from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, text, UniqueConstraint, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class Cart(Base):
    __tablename__ = "carts"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),
        {"schema": "public"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    cart_id = Column(UUID(as_uuid=True), ForeignKey("public.carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class Wishlist(Base):
    __tablename__ = "wishlists"
    __table_args__ = (
        UniqueConstraint("profile_id", "product_id", name="uq_profile_wishlist_product"),
        {"schema": "public"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_entries")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("profile_id", "product_id", name="uq_profile_product_review"),
        {"schema": "public"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    title = Column(String(150), nullable=True)
    comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    type = Column(String(50), nullable=False) # e.g. 'order_status', 'stock_alert', etc.
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="notifications")


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False) # e.g. 'user_registered', 'order_placed', etc.
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="activity_logs")


class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"
    __table_args__ = (
        UniqueConstraint("profile_id", "product_id", name="uq_profile_recently_viewed"),
        {"schema": "public"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="recently_viewed")
    product = relationship("Product", back_populates="recently_viewed_entries")
