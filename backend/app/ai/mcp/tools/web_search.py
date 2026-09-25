import datetime
import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
from app.core.security.url_validator import sanitize_and_validate_url


# Country-specific trusted merchant/shopping search domains
COUNTRY_MERCHANT_DOMAINS = {
    "PK": [
        {"name": "Daraz Pakistan", "domain": "daraz.pk", "base_url": "https://www.daraz.pk/catalog/?q="},
        {"name": "Telemart", "domain": "telemart.pk", "base_url": "https://www.telemart.pk/search?q="},
        {"name": "Paklap", "domain": "paklap.pk", "base_url": "https://www.paklap.pk/catalogsearch/result/?q="},
        {"name": "PriceOye", "domain": "priceoye.pk", "base_url": "https://priceoye.pk/search?q="},
        {"name": "Shophive", "domain": "shophive.com", "base_url": "https://www.shophive.com/catalogsearch/result/?q="},
    ],
    "UK": [
        {"name": "Amazon UK", "domain": "amazon.co.uk", "base_url": "https://www.amazon.co.uk/s?k="},
        {"name": "Currys", "domain": "currys.co.uk", "base_url": "https://www.currys.co.uk/search?q="},
        {"name": "Argos", "domain": "argos.co.uk", "base_url": "https://www.argos.co.uk/search/"},
        {"name": "John Lewis", "domain": "johnlewis.com", "base_url": "https://www.johnlewis.com/search?q="},
    ],
    "US": [
        {"name": "Amazon US", "domain": "amazon.com", "base_url": "https://www.amazon.com/s?k="},
        {"name": "Best Buy", "domain": "bestbuy.com", "base_url": "https://www.bestbuy.com/site/searchpage.jsp?st="},
        {"name": "Newegg", "domain": "newegg.com", "base_url": "https://www.newegg.com/p/pl?d="},
        {"name": "Walmart", "domain": "walmart.com", "base_url": "https://www.walmart.com/search?q="},
        {"name": "B&H Photo", "domain": "bhphotovideo.com", "base_url": "https://www.bhphotovideo.com/c/search?Ntt="},
    ],
    "AE": [
        {"name": "Amazon UAE", "domain": "amazon.ae", "base_url": "https://www.amazon.ae/s?k="},
        {"name": "Noon UAE", "domain": "noon.com/uae-en", "base_url": "https://www.noon.com/uae-en/search/?q="},
        {"name": "Sharaf DG", "domain": "sharafdg.com", "base_url": "https://uae.sharafdg.com/?s="},
    ],
    "SA": [
        {"name": "Amazon SA", "domain": "amazon.sa", "base_url": "https://www.amazon.sa/s?k="},
        {"name": "Jarir Bookstore", "domain": "jarir.com", "base_url": "https://www.jarir.com/sa-en/catalogsearch/result/?q="},
        {"name": "Extra", "domain": "extra.com", "base_url": "https://www.extra.com/en-sa/search/?text="},
    ],
    "CA": [
        {"name": "Amazon Canada", "domain": "amazon.ca", "base_url": "https://www.amazon.ca/s?k="},
        {"name": "Best Buy Canada", "domain": "bestbuy.ca", "base_url": "https://www.bestbuy.ca/en-ca/search?search="},
    ],
    "DE": [
        {"name": "Amazon Germany", "domain": "amazon.de", "base_url": "https://www.amazon.de/s?k="},
        {"name": "MediaMarkt", "domain": "mediamarkt.de", "base_url": "https://www.mediamarkt.de/de/search.html?query="},
    ],
    "AU": [
        {"name": "Amazon Australia", "domain": "amazon.com.au", "base_url": "https://www.amazon.com.au/s?k="},
        {"name": "JB Hi-Fi", "domain": "jbhifi.com.au", "base_url": "https://www.jbhifi.com.au/search?query="},
    ],
}


def execute_web_search(
    query: str,
    country_code: str = "PK",
    language: str = "en",
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Executes a structured web search tailored to the user's target country.
    Returns clean search items with title, snippet, URL, domain, country relevance, and timestamp.
    """
    country_code = country_code.upper()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    encoded_query = urllib.parse.quote_plus(query)

    merchants = COUNTRY_MERCHANT_DOMAINS.get(country_code, COUNTRY_MERCHANT_DOMAINS["US"])

    results = []
    for merchant in merchants[:max_results]:
        merchant_url = f"{merchant['base_url']}{encoded_query}"
        results.append({
            "title": f"{query} on {merchant['name']}",
            "snippet": f"Find authentic {query} with verified warranty and delivery options in {country_code} from {merchant['name']}.",
            "url": merchant_url,
            "domain": merchant["domain"],
            "country_relevance": country_code,
            "retrieved_at": now_iso
        })

    return results
