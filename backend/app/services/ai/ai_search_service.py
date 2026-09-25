import time
import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, text
from app.models.product import Product, ProductStatus
from app.models.search_analytics import SearchAnalytics
from app.schemas.ai import ParsedQueryIntent, ProductMatchItem, AISearchResponse


class AISearchService:
    def __init__(self, db: Session):
        self.db = db

    def parse_query_intent(self, query: str) -> ParsedQueryIntent:
        """
        Parses natural language query to extract structured intent:
        category, brand, max_price, min_price, ram, use_case, preferences, exclusions, sort_by.
        """
        q_lower = query.lower().strip()
        intent = ParsedQueryIntent()

        # 1. Price extraction (e.g. "under $1200", "under 100", "less than $500", "between 100 and 500")
        under_match = re.search(r'(?:under|below|less than|\<=|\<)\s*\$?(\d+(?:\.\d+)?)', q_lower)
        if under_match:
            intent.max_price = float(under_match.group(1))

        over_match = re.search(r'(?:above|over|more than|\>=|\>)\s*\$?(\d+(?:\.\d+)?)', q_lower)
        if over_match:
            intent.min_price = float(over_match.group(1))

        # 2. RAM extraction (e.g. "16gb", "32gb ram")
        ram_match = re.search(r'(\d+\s*gb)\s*(?:ram)?', q_lower)
        if ram_match:
            intent.ram = ram_match.group(1).upper().replace(" ", "")

        # 3. Category detection
        categories_map = {
            "laptop": "electronics",
            "ultrabook": "electronics",
            "computer": "electronics",
            "watch": "electronics",
            "chrono": "electronics",
            "headphone": "electronics",
            "earphone": "electronics",
            "audio": "electronics",
            "shoes": "fashion",
            "runner": "fashion",
            "sneakers": "fashion",
            "bag": "fashion",
            "crossbody": "fashion",
            "chair": "home-living",
            "lamp": "home-living",
            "desk": "home-living"
        }
        for kw, cat in categories_map.items():
            if kw in q_lower:
                intent.category = cat
                break

        # 4. Brand detection
        known_brands = ["nike", "aura", "neptune", "zenith", "apex", "luxe", "ergoform", "apple"]
        for b in known_brands:
            if b in q_lower:
                intent.brand = b.capitalize()
                break

        # 5. Use case detection
        use_cases = ["gaming", "fitness", "running", "office", "audio", "fashion", "photography"]
        for uc in use_cases:
            if uc in q_lower:
                intent.use_case = uc
                break

        # 6. Preferences & exclusions
        if "lightweight" in q_lower or "portable" in q_lower:
            intent.preferences.append("lightweight")
        if "battery" in q_lower:
            intent.preferences.append("long battery life")
        if "rtx" in q_lower or "gpu" in q_lower:
            intent.preferences.append("dedicated GPU")

        return intent

    def execute_hybrid_search(
        self, query: str, session_id: Optional[str] = None
    ) -> AISearchResponse:
        start_time = time.time()
        intent = self.parse_query_intent(query)

        # Base SQLAlchemy query for published products
        q = self.db.query(Product).filter(Product.status == ProductStatus.PUBLISHED.value)

        # Keyword tokens matching name, description, brand, or SKU
        tokens = [t for t in re.split(r'\s+', query.lower()) if len(t) > 2 and t not in ["for", "with", "and", "under", "the", "best", "show", "find", "get"]]

        # Fetch candidate products
        all_products = q.all()

        scored_matches: List[Tuple[Product, int, List[str]]] = []

        for p in all_products:
            score = 50  # Base match score
            reasons: List[str] = []

            p_name_lower = p.name.lower()
            p_desc_lower = (p.description or "").lower()
            p_attrs = p.attributes or {}
            p_specs = p.specifications or {}

            # Keyword matching score
            matched_tokens = 0
            for token in tokens:
                if token in p_name_lower or token in p_desc_lower:
                    matched_tokens += 1
            if tokens and matched_tokens > 0:
                score += int((matched_tokens / len(tokens)) * 30)

            # Category filter match
            if intent.category and p.category:
                if p.category.slug == intent.category or intent.category in p.category.name.lower():
                    score += 10

            # Price constraint check
            if intent.max_price is not None:
                if float(p.price) <= intent.max_price:
                    score += 15
                    reasons.append("✓ Within budget")
                else:
                    score -= 30  # Penalize over budget

            if intent.min_price is not None:
                if float(p.price) >= intent.min_price:
                    score += 10
                else:
                    score -= 20

            # Brand match
            p_brand = p_attrs.get("brand", "").lower()
            if intent.brand and (intent.brand.lower() in p_brand or intent.brand.lower() in p_name_lower):
                score += 15
                reasons.append(f"✓ Brand: {p_attrs.get('brand', intent.brand)}")

            # RAM match
            p_ram = p_attrs.get("ram", "") or p_specs.get("ram", "")
            if intent.ram and intent.ram.lower() in p_ram.lower():
                score += 15
                reasons.append(f"✓ {p_ram} RAM")

            # Use case match
            p_use_case = p_attrs.get("use_case", "").lower()
            if intent.use_case and intent.use_case in p_use_case:
                score += 15
                reasons.append(f"✓ Optimized for {intent.use_case}")

            # Specific preference checks
            if "lightweight" in intent.preferences:
                if p_attrs.get("weight_class") == "lightweight" or "1.3kg" in p_specs.get("weight", ""):
                    score += 10
                    reasons.append("✓ Lightweight design")

            if "long battery life" in intent.preferences and ("hours" in p_specs.get("battery_life", "")):
                score += 10
                reasons.append(f"✓ Battery: {p_specs.get('battery_life')}")

            if "dedicated GPU" in intent.preferences and ("gpu" in p_attrs or "rtx" in p_name_lower):
                score += 15
                reasons.append(f"✓ GPU: {p_attrs.get('gpu', 'Dedicated Graphics')}")

            # Default positive match reason if reasons empty
            if not reasons:
                if float(p.price) <= (intent.max_price or 99999):
                    reasons.append("✓ Relevant match for your search")

            if score > 35:
                # Clamp score to 99 max
                final_score = min(score, 99)
                scored_matches.append((p, final_score, reasons))

        # Sort products by score descending
        scored_matches.sort(key=lambda x: x[1], reverse=True)

        matched_items: List[ProductMatchItem] = []
        for p, score, reasons in scored_matches:
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
                    match_score=score,
                    match_reasons=reasons,
                    attributes=p.attributes or {},
                    specifications=p.specifications or {}
                )
            )

        latency = int((time.time() - start_time) * 1000)

        # Build summary
        if matched_items:
            constraints_str = []
            if intent.max_price:
                constraints_str.append(f"under ${intent.max_price:.0f}")
            if intent.ram:
                constraints_str.append(f"{intent.ram} RAM")
            if intent.use_case:
                constraints_str.append(f"for {intent.use_case}")
            
            c_desc = ", ".join(constraints_str) if constraints_str else "your specified preferences"
            summary = f"AI found {len(matched_items)} products matching {c_desc}."
        else:
            summary = f"No exact matches found for '{query}'. Try widening your budget or clearing specific brand filters."

        # Search suggestions
        suggestions = [
            "Gaming laptops under $1200",
            "Best running shoes under $100",
            "Smartwatches with long battery",
            "Noise cancelling headphones"
        ]

        # Log analytics
        analytics = SearchAnalytics(
            query=query,
            parsed_intent=intent.model_dump(),
            results_count=len(matched_items),
            latency_ms=latency,
            session_id=session_id
        )
        self.db.add(analytics)
        self.db.commit()

        return AISearchResponse(
            success=True,
            query=query,
            parsed_intent=intent,
            summary=summary,
            total_matches=len(matched_items),
            products=matched_items,
            suggestions=suggestions,
            latency_ms=latency
        )
