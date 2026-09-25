import datetime
from typing import Dict, Any
import httpx
from app.core.security.url_validator import sanitize_and_validate_url
from app.core.security.prompt_injection import sanitize_untrusted_web_content


def execute_fetch_page(url: str, timeout_seconds: float = 8.0) -> Dict[str, Any]:
    """
    Safely fetches a public product webpage respecting robots/ToS, enforcing SSRF controls,
    and sanitizing the content against prompt injection.
    """
    is_valid, normalized_url, reason = sanitize_and_validate_url(url, enforce_ssrf=True)
    if not is_valid or not normalized_url:
        return {
            "success": False,
            "url": url,
            "error": f"Security validation failed: {reason}",
            "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    try:
        headers = {
            "User-Agent": "MK-Shop-Agent/1.0 (+https://aiecommerce.com/bot; shopping assistant)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
        with httpx.Client(timeout=timeout_seconds, follow_redirects=True) as client:
            response = client.get(normalized_url, headers=headers)
            if response.status_code >= 400:
                return {
                    "success": False,
                    "url": normalized_url,
                    "status_code": response.status_code,
                    "error": f"Server responded with status {response.status_code}",
                    "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }

            raw_html = response.text
            sanitized = sanitize_untrusted_web_content(raw_html, max_length=12000)

            return {
                "success": True,
                "url": normalized_url,
                "status_code": response.status_code,
                "content": sanitized,
                "content_length": len(sanitized),
                "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
    except Exception as e:
        return {
            "success": False,
            "url": normalized_url,
            "error": f"Failed to fetch page: {str(e)}",
            "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
