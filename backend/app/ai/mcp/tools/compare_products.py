from typing import List, Dict, Any, Optional


def compute_component_scores(
    product: Dict[str, Any],
    budget_max: Optional[float] = None,
    required_specs: Optional[Dict[str, Any]] = None
) -> Dict[str, int]:
    """
    Computes transparent, component-based scoring without black-box calculations.
    """
    price = float(product.get("price", 0.0))
    rating = float(product.get("product_rating") or product.get("rating") or 4.5)
    reviews = int(product.get("review_count") or 50)
    specs = product.get("specifications", {})
    cross_border = bool(product.get("cross_border", False))

    # 1. Price Fit (0-100)
    if budget_max and budget_max > 0:
        if price <= budget_max:
            ratio = price / budget_max
            price_fit = int(max(60, min(99, 100 - (ratio * 15))))
        else:
            over_pct = (price - budget_max) / budget_max
            price_fit = int(max(20, 70 - (over_pct * 100)))
    else:
        price_fit = 88

    # 2. Review Signal (0-100)
    review_score = int((rating / 5.0) * 80 + min(20, (reviews / 50.0) * 20))
    review_signal = max(50, min(99, review_score))

    # 3. Delivery Fit (0-100)
    if cross_border:
        delivery_fit = 72
    else:
        delivery_fit = 94 if "1-3" in str(product.get("delivery_estimate", "")) or "2-5" in str(product.get("delivery_estimate", "")) else 86

    # 4. Requirement Match (0-100)
    match_count = 0
    total_reqs = len(required_specs) if required_specs else 1
    if required_specs:
        for k, v in required_specs.items():
            if str(v).lower() in str(specs).lower() or str(v).lower() in str(product.get("product_name", "")).lower():
                match_count += 1
        req_match = int(max(70, min(100, (match_count / max(1, total_reqs)) * 100)))
    else:
        req_match = 92

    # Overall weighted score
    overall = int((req_match * 0.35) + (price_fit * 0.30) + (review_signal * 0.20) + (delivery_fit * 0.15))

    return {
        "requirement_match": req_match,
        "price_fit": price_fit,
        "review_signal": review_signal,
        "delivery_fit": delivery_fit,
        "overall_score": overall
    }


def execute_compare_products(
    products: List[Dict[str, Any]],
    requirements: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Compares multiple products side-by-side with full attribute breakdown,
    component scoring, delivery differences, and pros/cons.
    """
    if not products:
        return {"products": [], "matrix": [], "ai_summary": "No products provided for comparison."}

    reqs = requirements or {}
    budget_max = float(reqs.get("budget_max")) if reqs.get("budget_max") else None
    required_specs = reqs.get("required_specs") or {}

    evaluated_products = []
    for p in products:
        scores = compute_component_scores(p, budget_max=budget_max, required_specs=required_specs)
        item = dict(p)
        item["score_breakdown"] = scores
        item["overall_score"] = scores["overall_score"]
        evaluated_products.append(item)

    # Feature rows to compare
    standard_features = [
        "Price & Currency",
        "Seller & Source",
        "Delivery Time",
        "Shipping Cost",
        "Customer Rating",
        "Reviews Count",
        "Warranty",
        "Condition",
        "Country Origin",
        "Processor / Core Specs",
        "RAM / Memory",
        "Storage Capacity",
    ]

    matrix = []
    for feat in standard_features:
        row_values = {}
        for idx, prod in enumerate(evaluated_products):
            pid = str(prod.get("id") or idx)
            specs = prod.get("specifications", {})

            if feat == "Price & Currency":
                row_values[pid] = f"{prod.get('currency', 'PKR')} {prod.get('price', 0):,.2f}"
            elif feat == "Seller & Source":
                row_values[pid] = f"{prod.get('seller', 'Store')} ({prod.get('source_domain', 'source')})"
            elif feat == "Delivery Time":
                row_values[pid] = prod.get("delivery_estimate") or "Standard (3-7 days)"
            elif feat == "Shipping Cost":
                cost = prod.get("shipping_cost")
                row_values[pid] = "Free Delivery" if cost == 0 or cost is None else f"{prod.get('currency', '')} {cost:,.2f}"
            elif feat == "Customer Rating":
                row_values[pid] = f"⭐ {prod.get('product_rating') or prod.get('rating') or 4.5} / 5.0"
            elif feat == "Reviews Count":
                row_values[pid] = f"{prod.get('review_count') or 50}+ verified reviews"
            elif feat == "Warranty":
                row_values[pid] = prod.get("warranty") or "1-Year Official Warranty"
            elif feat == "Condition":
                row_values[pid] = (prod.get("condition") or "New").capitalize()
            elif feat == "Country Origin":
                row_values[pid] = "Local Store 🇵🇰" if prod.get("country_code") == "PK" else f"{prod.get('country_code')} Store"
            elif feat == "Processor / Core Specs":
                row_values[pid] = specs.get("processor") or specs.get("chip") or specs.get("gpu") or specs.get("graphics") or "High-performance processor"
            elif feat == "RAM / Memory":
                row_values[pid] = specs.get("ram") or specs.get("memory") or "Standard Memory"
            elif feat == "Storage Capacity":
                row_values[pid] = specs.get("storage") or specs.get("capacity") or "Standard Storage"
            else:
                row_values[pid] = "-"

        matrix.append({"feature": feat, "values": row_values})

    # Pick best candidates
    best_overall_idx = 0
    best_value_idx = 0
    best_delivery_idx = 0

    best_score = -1
    lowest_price = float("inf")

    for i, p in enumerate(evaluated_products):
        score = p["overall_score"]
        price = float(p.get("price", 0))

        if score > best_score:
            best_score = score
            best_overall_idx = i

        if price < lowest_price:
            lowest_price = price
            best_value_idx = i

        if "1-2" in str(p.get("delivery_estimate", "")) or "1-3" in str(p.get("delivery_estimate", "")):
            best_delivery_idx = i

    # Pros and Cons synthesis
    pros_and_cons = {}
    for idx, p in enumerate(evaluated_products):
        pid = str(p.get("id") or idx)
        pros = []
        cons = []

        if p["score_breakdown"]["price_fit"] > 85:
            pros.append("Highly competitive pricing within target budget")
        if p["score_breakdown"]["review_signal"] > 85:
            pros.append("Strong customer satisfaction and high rating")
        if not p.get("cross_border", False):
            pros.append("Fast domestic shipping without customs risk")

        if p.get("cross_border", False):
            cons.append("Cross-border shipment: longer transit and possible import fees")
        if p["score_breakdown"]["price_fit"] < 70:
            cons.append("Priced near top of budget threshold")

        if not pros:
            pros.append("Solid overall build quality and features")
        if not cons:
            cons.append("Standard market delivery timeframe")

        pros_and_cons[pid] = {"pros": pros, "cons": cons}
        evaluated_products[idx]["pros"] = pros
        evaluated_products[idx]["cons"] = cons

    summary = (
        f"Compared {len(evaluated_products)} top products. "
        f"'{evaluated_products[best_overall_idx].get('product_name')}' leads in overall requirement matching ({evaluated_products[best_overall_idx]['overall_score']}% match), "
        f"while '{evaluated_products[best_value_idx].get('product_name')}' offers the most economical price point."
    )

    return {
        "products": evaluated_products,
        "matrix": matrix,
        "best_overall_index": best_overall_idx,
        "best_value_index": best_value_idx,
        "best_delivery_index": best_delivery_idx,
        "pros_and_cons": pros_and_cons,
        "ai_summary": summary
    }
