import datetime
import re
from typing import Dict, Any, Optional
from urllib.parse import urlparse


def execute_extract_product(
    raw_data: Dict[str, Any],
    source_url: str = "",
    country_code: str = "PK",
    currency: str = "PKR"
) -> Dict[str, Any]:
    """
    Extracts structured product data from raw dictionary/page payload without fabricating facts.
    """
    domain = urlparse(source_url).netloc if source_url else raw_data.get("source_domain", "merchant.com")
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    product_name = raw_data.get("product_name") or raw_data.get("name") or raw_data.get("title") or "Unnamed Product"
    price = float(raw_data.get("price", 0.0))
    orig_price = raw_data.get("original_price") or raw_data.get("compare_at_price")
    original_price = float(orig_price) if orig_price else None

    discount = None
    if original_price and original_price > price:
        discount = round(((original_price - price) / original_price) * 100, 1)

    return {
        "product_name": product_name,
        "brand": raw_data.get("brand"),
        "model": raw_data.get("model"),
        "price": price,
        "currency": raw_data.get("currency", currency),
        "original_price": original_price,
        "discount": discount,
        "availability": raw_data.get("availability", "in_stock"),
        "seller": raw_data.get("seller") or domain,
        "seller_rating": float(raw_data["seller_rating"]) if raw_data.get("seller_rating") is not None else None,
        "product_rating": float(raw_data["product_rating"]) if raw_data.get("product_rating") is not None else None,
        "review_count": int(raw_data["review_count"]) if raw_data.get("review_count") is not None else None,
        "condition": raw_data.get("condition", "new"),
        "specifications": raw_data.get("specifications", {}),
        "shipping_cost": float(raw_data["shipping_cost"]) if raw_data.get("shipping_cost") is not None else None,
        "delivery_estimate": raw_data.get("delivery_estimate"),
        "warranty": raw_data.get("warranty"),
        "country_code": country_code.upper(),
        "source_url": source_url or raw_data.get("source_url", ""),
        "source_domain": domain,
        "image_url": raw_data.get("image_url"),
        "cross_border": bool(raw_data.get("cross_border", False)),
        "retrieved_at": raw_data.get("retrieved_at") or now_iso
    }
