import jwt
import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.security.ssrf_protection import validate_url_for_ssrf, is_ip_private_or_restricted
from app.core.security.url_validator import sanitize_and_validate_url
from app.core.security.prompt_injection import detect_prompt_injection, sanitize_untrusted_web_content
from app.core.security.mcp_guardrails import validate_mcp_tool_invocation, READ_ONLY_TOOLS, SENSITIVE_ACTION_TOOLS
from app.core.security.rate_limiter import chat_rate_limiter, mcp_rate_limiter, payment_rate_limiter


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    """
    Creates a JWT access token compatible with Supabase Auth verification.
    """
    to_encode = data.copy()
    if "aud" not in to_encode:
        to_encode["aud"] = "authenticated"
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a Supabase Auth JWT token.
    Uses the SUPABASE_JWT_SECRET for verification.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.ALGORITHM],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    import bcrypt
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    if not hashed_password or not plain_password:
        return False
    import bcrypt
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


__all__ = [
    "create_access_token",
    "decode_token",
    "hash_password",
    "verify_password",
    "validate_url_for_ssrf",
    "is_ip_private_or_restricted",
    "sanitize_and_validate_url",
    "detect_prompt_injection",
    "sanitize_untrusted_web_content",
    "validate_mcp_tool_invocation",
    "READ_ONLY_TOOLS",
    "SENSITIVE_ACTION_TOOLS",
    "chat_rate_limiter",
    "mcp_rate_limiter",
    "payment_rate_limiter",
]
