from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    products,
    cart,
    orders,
    reviews,
    dashboard,
    notifications,
    ai,
    agent
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(products.router, prefix="/products", tags=["Products & Catalog"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart & Wishlist"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders & Coupons"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Product Reviews"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Search & Intelligence"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Shopping Agent & MCP"])


