# Import all the models, so that Base has them before being
# imported by Alembic/other modules.
from app.database.session import Base  # noqa
from app.models.profile import Profile, Address, UserRole  # noqa
from app.models.product import Category, Product, ProductImage, Inventory, ProductStatus  # noqa
from app.models.order import Coupon, Order, OrderItem, Payment, OrderStatus, PaymentStatus, PaymentProvider, DiscountType  # noqa
from app.models.interaction import Cart, CartItem, Wishlist, Review, Notification, ActivityLog, RecentlyViewed  # noqa
from app.models.search_analytics import SearchAnalytics, ConversationalSession  # noqa
from app.models.shopping_agent import (  # noqa
    ShoppingSession,
    ShoppingRequirement,
    AgentRun,
    AgentToolCall,
    ExternalProduct,
    ProductSource,
    ProductComparison,
    ShippingQuote,
    PriceObservation,
    PaymentIntent,
)

