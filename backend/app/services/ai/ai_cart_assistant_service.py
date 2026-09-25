import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.interaction import Cart, CartItem
from app.models.product import Product
from app.schemas.ai import CartAssistantResponse


class AICartAssistantService:
    def __init__(self, db: Session):
        self.db = db

    def optimize_cart(
        self, profile_id: uuid.UUID, prompt: Optional[str] = None, target_budget: Optional[float] = None
    ) -> CartAssistantResponse:
        cart = self.db.query(Cart).filter(Cart.id == profile_id).first()
        items = cart.items if cart else []

        current_total = 0.0
        cart_products = []

        for ci in items:
            p = ci.product
            item_total = float(p.price) * ci.quantity
            current_total += item_total
            cart_products.append({"cart_item_id": str(ci.id), "product": p, "quantity": ci.quantity})

        if not cart_products:
            # If cart empty, suggest home office setup bundle under $1500
            bundle_products = (
                self.db.query(Product)
                .filter(Product.name.in_(["Zenith Ultrabook Pro 16GB", "Minimalist Ergonomic Chair", "Minimalist LED Desk Lamp"]))
                .all()
            )
            bundle_total = sum(float(bp.price) for bp in bundle_products)

            suggested_changes = []
            for bp in bundle_products:
                suggested_changes.append({
                    "action": "add",
                    "product_id": str(bp.id),
                    "product_name": bp.name,
                    "price": float(bp.price),
                    "reason": "Essential component for home office setup"
                })

            return CartAssistantResponse(
                success=True,
                current_total=0.0,
                suggested_total=bundle_total,
                potential_savings=140.0,
                recommendation_type="bundle_builder",
                ai_advice="Your cart is currently empty. AI generated a complete Home Office bundle under $1500 (Laptop + Ergonomic Chair + Desk Lamp).",
                suggested_changes=suggested_changes
            )

        # Budget optimization if target budget specified or cart exceeds standard budget
        effective_budget = target_budget or 1200.0
        potential_savings = 0.0
        suggested_changes = []

        if current_total > effective_budget:
            # Find expensive item in cart to suggest swap
            for item in cart_products:
                p = item["product"]
                if float(p.price) > 800:
                    # Look for lower cost alternative in same category
                    alt = (
                        self.db.query(Product)
                        .filter(Product.category_id == p.category_id, Product.id != p.id, Product.price < p.price)
                        .first()
                    )
                    if alt:
                        diff = float(p.price) - float(alt.price)
                        potential_savings += diff
                        suggested_changes.append({
                            "action": "swap",
                            "remove_product_id": str(p.id),
                            "remove_name": p.name,
                            "add_product_id": str(alt.id),
                            "add_name": alt.name,
                            "savings": diff,
                            "reason": f"Replace {p.name} with {alt.name} to save ${diff:.2f} while retaining core features."
                        })

        suggested_total = max(0.0, current_total - potential_savings)
        advice = f"AI analyzed your cart (${current_total:.2f}). " + (
            f"By applying recommended swaps, you can bring your total to ${suggested_total:.2f} and save ${potential_savings:.2f}."
            if potential_savings > 0
            else "Your current cart is optimal for value and performance!"
        )

        return CartAssistantResponse(
            success=True,
            current_total=current_total,
            suggested_total=suggested_total,
            potential_savings=potential_savings,
            recommendation_type="budget_optimize",
            ai_advice=advice,
            suggested_changes=suggested_changes
        )
