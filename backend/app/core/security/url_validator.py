import re
from urllib.parse import urlparse, urlunparse
from typing import Tuple, Optional
from app.core.security.ssrf_protection import validate_url_for_ssrf


BLOCKED_DOMAINS = {
    "evil.com",
    "malicious-site.test",
    "attacker-server.com",
    "phishing.example",
}

DISALLOWED_SCHEMES = ("javascript:", "data:", "file:", "ftp:", "ws:", "wss:", "gopher:", "ldap:")


def sanitize_and_validate_url(url: str, enforce_ssrf: bool = True) -> Tuple[bool, Optional[str], str]:
    """
    Validates and normalizes URLs. Returns (is_valid, normalized_url, reason).
    """
    if not url or not isinstance(url, str):
        return False, None, "URL must be a non-empty string"

    url_clean = url.strip()
    url_lower = url_clean.lower()

    for scheme in DISALLOWED_SCHEMES:
        if url_lower.startswith(scheme):
            return False, None, f"Disallowed URL scheme: '{scheme}'"

    if not url_clean.startswith("http://") and not url_clean.startswith("https://"):
        if "://" in url_clean:
            return False, None, "Unsupported protocol."
        url_clean = "https://" + url_clean

    try:
        parsed = urlparse(url_clean)
    except Exception as e:
        return False, None, f"Invalid URL format: {str(e)}"

    if not parsed.netloc:
        return False, None, "Invalid URL host"

    domain = parsed.hostname.lower() if parsed.hostname else ""
    if domain in BLOCKED_DOMAINS:
        return False, None, f"Domain '{domain}' is blocked by security policy."

    if enforce_ssrf:
        is_safe_ssrf, ssrf_reason = validate_url_for_ssrf(url_clean)
        if not is_safe_ssrf:
            return False, None, ssrf_reason

    normalized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path,
        parsed.params,
        parsed.query,
        ""
    ))

    return True, normalized, "URL is valid"
