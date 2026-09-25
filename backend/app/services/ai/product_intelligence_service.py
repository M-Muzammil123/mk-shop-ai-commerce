from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.ai import (
    ProductAIInsightResponse, ProductCompareResponse,
    SpecComparisonRow, ProductMatchItem
)


class ProductIntelligenceService:
    def __init__(self, db: Session):
        self.db = db

    def get_product_insights(self, product_id: UUID) -> ProductAIInsightResponse:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return ProductAIInsightResponse(
                product_id=product_id,
                why_this_product=["High customer satisfaction", "Solid build quality"],
                best_for="General daily use",
                potential_downside="Higher demand may cause limited stock availability"
            )

        attrs = product.attributes or {}
        specs = product.specifications or {}
        price = float(product.price)
        name = product.name

        why_reasons = []
        if price < 150:
            why_reasons.append("✓ Exceptional value for money in its category")
        elif price > 1000:
            why_reasons.append("✓ Flagship performance with premium materials and finish")

        if "battery_life" in specs:
            why_reasons.append(f"✓ Extended battery life rated at {specs['battery_life']}")
        if "ram" in attrs or "ram" in specs:
            why_reasons.append(f"✓ Powerful multitasking with {attrs.get('ram', specs.get('ram'))} memory")
        if "noise_cancelling" in attrs:
            why_reasons.append("✓ Active ANC crystal-clear sound isolation")

        if not why_reasons:
            why_reasons = [
                "✓ Sleek modern aesthetics designed for long longevity",
                "✓ Strongly positive user reviews across all parameters",
                "✓ Reliable official warranty & customer support"
            ]

        # Best for
        use_case = attrs.get("use_case", "everyday productivity and entertainment")
        best_for_desc = f"{use_case.capitalize()} & active lifestyle"

        # Potential downside
        if price > 1000:
            downside = "Higher price point compared to entry-level alternatives"
        elif "heavy" in attrs.get("weight_class", "") or (float(specs.get("weight", "0").replace("kg", "").replace("g", "") or 0) > 2000):
            downside = "Slightly heavier build footprint compared to ultraportables"
        else:
            downside = "High market demand may lead to low stock availability during sales"

        return ProductAIInsightResponse(
            product_id=product_id,
            why_this_product=why_reasons,
            best_for=best_for_desc,
            potential_downside=downside,
            match_score=94
        )

    def compare_products(self, product_ids: List[UUID]) -> ProductCompareResponse:
        products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
        if not products:
            return ProductCompareResponse(
                success=False,
                products=[],
                spec_table=[],
                ai_summary="No valid products selected for comparison."
            )

        matched_items: List[ProductMatchItem] = []
        for p in products:
            imgs = [{"image_url": img.image_url, "is_primary": img.is_primary} for img in p.images] if p.images else []
            matched_items.append(
                ProductMatchItem(
                    id=p.id,
                    name=p.name,
                    slug=p.slug,
                    price=float(p.price),
                    compare_at_price=float(p.compare_at_price) if p.compare_at_price else None,
                    is_featured=p.is_featured,
                    status=p.status,
                    images=imgs,
                    attributes=p.attributes or {},
                    specifications=p.specifications or {}
                )
            )

        # Build side-by-side spec comparison table
        all_feature_keys = set()
        for p in products:
            all_feature_keys.update((p.specifications or {}).keys())
            all_feature_keys.update((p.attributes or {}).keys())

        # Include standard rows: Price, Brand, Category
        rows: List[SpecComparisonRow] = []

        # Row 1: Price
        price_values = {str(p.id): f"${float(p.price):.2f}" for p in products}
        rows.append(SpecComparisonRow(feature="Price", values=price_values))

        # Row 2: Brand
        brand_values = {str(p.id): (p.attributes or {}).get("brand", "N/A") for p in products}
        rows.append(SpecComparisonRow(feature="Brand", values=brand_values))

        # Row 3: Specifications & Attributes
        for key in sorted(list(all_feature_keys)):
            if key in ["brand", "price"]:
                continue
            val_map = {}
            for p in products:
                val = (p.specifications or {}).get(key) or (p.attributes or {}).get(key) or "N/A"
                val_map[str(p.id)] = str(val)
            rows.append(SpecComparisonRow(feature=key.replace("_", " ").title(), values=val_map))

        # Determine awards
        sorted_by_price = sorted(products, key=lambda x: float(x.price))
        best_value_id = sorted_by_price[0].id if sorted_by_price else None
        best_performance_id = sorted_by_price[-1].id if sorted_by_price else None
        
        # Best overall: featured or middle balanced
        best_overall_id = products[0].id if products else None
        for p in products:
            if p.is_featured:
                best_overall_id = p.id
                break

        summary = f"Comparing {len(products)} products. {products[0].name} excels in design quality, while {sorted_by_price[0].name} provides maximum budget efficiency."

        return ProductCompareResponse(
            success=True,
            products=matched_items,
            spec_table=rows,
            best_overall_id=best_overall_id,
            best_value_id=best_value_id,
            best_performance_id=best_performance_id,
            ai_summary=summary
        )
