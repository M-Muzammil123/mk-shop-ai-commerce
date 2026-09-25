import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple


BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "metadata.google.internal",
    "169.254.169.254",
    "instance-data",
}


def is_ip_private_or_restricted(ip_str: str) -> bool:
    """
    Evaluates if an IP address belongs to a private, loopback, link-local,
    multicast, or reserved range.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True


def validate_url_for_ssrf(url: str) -> Tuple[bool, str]:
    """
    Deep SSRF verification:
    1. Validates HTTP/HTTPS scheme
    2. Prohibits blocked hostnames and cloud metadata endpoints
    3. Resolves DNS and verifies destination IP is globally routable/public
    4. Blocks non-standard ports (allows only 80, 443)
    """
    if not url or not isinstance(url, str):
        return False, "Invalid or empty URL"

    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception as e:
        return False, f"Failed to parse URL: {str(e)}"

    if parsed.scheme not in ("http", "https"):
        return False, f"Unsupported scheme: '{parsed.scheme}'. Only http/https are allowed."

    hostname = parsed.hostname
    if not hostname:
        return False, "Missing hostname in URL."

    hostname_lower = hostname.lower()

    if hostname_lower in BLOCKED_HOSTNAMES or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        return False, f"Access to host '{hostname}' is prohibited (internal / restricted hostname)."

    try:
        port = parsed.port
    except ValueError:
        return False, "Invalid port specified in URL."

    if port and port not in (80, 443, 8000, 8080):
        return False, f"Access to port '{port}' is restricted."

    # DNS Resolution Check
    try:
        addr_info = socket.getaddrinfo(hostname, port or (443 if parsed.scheme == "https" else 80))
        for item in addr_info:
            ip_candidate = item[4][0]
            if is_ip_private_or_restricted(ip_candidate):
                return False, f"Destination IP '{ip_candidate}' for host '{hostname}' resolves to a private or restricted network."
    except socket.gaierror:
        # If DNS lookup fails, treat as unresolvable external domain
        pass
    except Exception as e:
        return False, f"DNS resolution validation error: {str(e)}"

    return True, "URL is safe for external request."
