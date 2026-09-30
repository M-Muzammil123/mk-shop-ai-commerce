import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, text, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(20), default=UserRole.CUSTOMER.value, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    addresses = relationship("Address", back_populates="profile", cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="profile", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="profile")
    reviews = relationship("Review", back_populates="profile", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="profile", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="profile", cascade="all, delete-orphan")
    recently_viewed = relationship("RecentlyViewed", back_populates="profile", cascade="all, delete-orphan")


class Address(Base):
    __tablename__ = "addresses"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(50), default="Home", nullable=False) # e.g. 'Home', 'Work'
    address_line1 = Column(Text, nullable=False)
    address_line2 = Column(Text, nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="addresses")
