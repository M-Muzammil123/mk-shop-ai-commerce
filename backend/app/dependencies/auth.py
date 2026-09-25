from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_token
from app.models.profile import Profile, UserRole

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Profile:
    """
    FastAPI dependency that extracts the Bearer token, decodes it using the
    Supabase JWT Secret, and loads the corresponding user profile from the database.
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Query database to retrieve user profile
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not found in application database",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return profile


def get_current_admin(
    current_user: Profile = Depends(get_current_user)
) -> Profile:
    """
    FastAPI dependency that restricts endpoint access to Admin users only.
    """
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required"
        )
    return current_user


security_optional = HTTPBearer(auto_error=False)


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: Session = Depends(get_db)
) -> Optional[Profile]:
    """
    FastAPI dependency that attempts to load the current user profile if a token is present, returning None if unauthenticated.
    """
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(Profile).filter(Profile.id == user_id).first()
    except Exception:
        return None

