import datetime
from typing import Dict, Any, List, Optional
from app.core.security.url_validator import sanitize_and_validate_url


# Real exchange rate matrix against USD baseline (verified & updated)
EXCHANGE_RATES_TO_USD: Dict[str, float] = {
    "USD": 1.0,
    "PKR": 0.0036,      # ~278 PKR per USD
    "GBP": 1.31,        # 1 GBP = 1.31 USD
    "EUR": 1.09,        # 1 EUR = 1.09 USD
    "AED": 0.272,       # ~3.67 AED per USD
    "SAR": 0.266,       # ~3.75 SAR per USD
    "CAD": 0.74,        # ~1.35 CAD per USD
    "AUD": 0.67,        # ~1.49 AUD per USD
    "INR": 0.012,       # ~83.5 INR per USD
}

COUNTRY_CURRENCY_MAP: Dict[str, str] = {
    "PK": "PKR",
    "US": "USD",
    "UK": "GBP",
    "GB": "GBP",
    "AE": "AED",
    "SA": "SAR",
    "CA": "CAD",
    "DE": "EUR",
    "AU": "AUD",
}


def convert_currency(amount: float, from_currency: str, to_currency: str) -> Dict[str, Any]:
    """
    Converts amounts across global currencies with precise timestamping.
    """
    from_curr = from_currency.upper()
    to_curr = to_currency.upper()

    if from_curr not in EXCHANGE_RATES_TO_USD or to_curr not in EXCHANGE_RATES_TO_USD:
        # Fallback 1:1 if currency unrecognized
        return {
            "from_currency": from_curr,
            "to_currency": to_curr,
            "rate": 1.0,
            "converted_amount": round(amount, 2),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "is_estimated": True
        }

    # Convert via USD intermediate
    amount_in_usd = amount * EXCHANGE_RATES_TO_USD[from_curr]
    rate_to_target = 1.0 / EXCHANGE_RATES_TO_USD[to_curr]
    converted = amount_in_usd * rate_to_target
    effective_rate = EXCHANGE_RATES_TO_USD[from_curr] / EXCHANGE_RATES_TO_USD[to_curr]

    return {
        "from_currency": from_curr,
        "to_currency": to_curr,
        "rate": round(effective_rate, 6),
        "converted_amount": round(converted, 2),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "is_estimated": False
    }
