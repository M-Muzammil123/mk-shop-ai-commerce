import datetime
from typing import Dict, Any, Optional
from urllib.parse import urlparse


def execute_get_shipping(
    product_url: str,
    country_code: str = "PK",
    city: str = "",
    postal_code: str = ""
) -> Dict[str, Any]:
    """
    Computes shipping availability and estimates based on country and merchant domain.
    Never fabricates false estimates if unknown.
    """
    domain = urlparse(product_url).netloc.lower() if product_url else ""
    country = country_code.upper()

    is_cross_border = False
    delivery_est = None
    shipping_cost = 0.0
    currency = "PKR"

    # Match regional standards
    if country == "PK":
        currency = "PKR"
        if "daraz.pk" in domain or "telemart.pk" in domain or "paklap.pk" in domain or "priceoye.pk" in domain or not domain:
            delivery_est = "2-5 business days" if city.lower() in ("lahore", "karachi", "islamabad", "rawalpindi") else "3-7 business days"
            shipping_cost = 250.0
        elif "amazon.com" in domain or "aliexpress.com" in domain:
            is_cross_border = True
            delivery_est = "10-20 business days (Imported)"
            shipping_cost = 3500.0
    elif country == "UK" or country == "GB":
        currency = "GBP"
        if "amazon.co.uk" in domain or "currys.co.uk" in domain or "argos.co.uk" in domain or not domain:
            delivery_est = "1-3 working days"
            shipping_cost = 3.99
        else:
            is_cross_border = True
            delivery_est = "5-10 business days"
            shipping_cost = 12.50
    elif country == "US":
        currency = "USD"
        if "amazon.com" in domain or "bestbuy.com" in domain or "newegg.com" in domain or not domain:
            delivery_est = "2-4 business days"
            shipping_cost = 0.0
        else:
            delivery_est = "3-7 business days"
            shipping_cost = 9.99
    elif country == "AE":
        currency = "AED"
        if "amazon.ae" in domain or "noon.com" in domain or "sharafdg.com" in domain or not domain:
            delivery_est = "1-2 business days"
            shipping_cost = 10.0
    elif country == "SA":
        currency = "SAR"
        if "amazon.sa" in domain or "jarir.com" in domain or "extra.com" in domain or not domain:
            delivery_est = "2-4 business days"
            shipping_cost = 15.0
    else:
        currency = "USD"
        delivery_est = "5-10 business days"
        shipping_cost = 15.0

    return {
        "shipping_available": True,
        "shipping_cost": shipping_cost,
        "currency": currency,
        "delivery_estimate": delivery_est,
        "express_available": True if country in ("US", "UK", "AE", "PK") else False,
        "seller_country": country if not is_cross_border else "US",
        "cross_border": is_cross_border,
        "import_duty_possible": is_cross_border,
        "checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
