from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, VerifyOTPRequest, TokenResponse, ProfileResponse, ResetPasswordRequest, ChangePasswordRequest, ProfileUpdate, AddressCreate, AddressResponse
from app.models.profile import Profile, Address
from app.utils.supabase import supabase_client
from app.core.config import settings
from app.dependencies.auth import get_current_user
import jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("app")
router = APIRouter()

# Helper to check if Supabase is running with placeholder config
def is_supabase_placeholder() -> bool:
    return "your-project-id" in settings.SUPABASE_URL or "placeholder" in settings.SUPABASE_SERVICE_ROLE_KEY

def generate_local_jwt(user_id: str, email: str, role: str) -> str:
    """
    Generates a fallback JWT token locally when running without a real Supabase instance.
    """
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "aud": "authenticated",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new user. Connects to Supabase Auth and triggers database profile sync.
    If Supabase credentials are placeholders, falls back to a simulated DB entry.
    """
    first_name = req.first_name or ""
    last_name = req.last_name or ""
    role = req.role or "customer"

    if is_supabase_placeholder():
        logger.warning("Supabase URL is placeholder. Simulating local registration.")
        # Check if email already exists locally
        existing = db.query(Profile).filter(Profile.email == req.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        import uuid
        user_id = str(uuid.uuid4())
        
        # Create profile directly
        profile = Profile(
            id=user_id,
            first_name=first_name,
            last_name=last_name,
            email=req.email,
            phone=req.phone,
            role=role
        )
        db.add(profile)
        
        # Initialize Cart
        from app.models.interaction import Cart
        cart = Cart(id=user_id)
        db.add(cart)
        
        db.commit()
        db.refresh(profile)
        return profile

    try:
        # Standard Supabase Sign Up
        res = supabase_client.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "phone": req.phone,
            "options": {
                "data": {
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": role
                }
            }
        })
        user_id = res.user.id
        
        # In a real app, the database sync trigger 'handle_new_user' executes in Supabase.
        # But we double-check if the profile has synced, or force create it locally if sync hasn't run.
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if not profile:
            profile = Profile(
                id=user_id,
                first_name=first_name,
                last_name=last_name,
                email=req.email,
                phone=req.phone,
                role=role
            )
            db.add(profile)
            
            from app.models.interaction import Cart
            cart = Cart(id=user_id)
            db.add(cart)
            
            db.commit()
            db.refresh(profile)
            
        return profile
    except Exception as e:
        logger.error(f"Supabase Sign Up failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates a user. Returns access token and user profile.
    If Supabase credentials are placeholders, validates locally.
    """
    if is_supabase_placeholder():
        logger.warning("Supabase URL is placeholder. Simulating local login.")
        # Search by email or phone
        profile = None
        if req.email:
            profile = db.query(Profile).filter(Profile.email == req.email).first()
        elif req.phone:
            profile = db.query(Profile).filter(Profile.phone == req.phone).first()

        if not profile:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        # In local testing, bypass actual bcrypt match for simplified developer setup
        token = generate_local_jwt(profile.id, profile.email, profile.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "profile": profile
        }

    try:
        # Sign in using Supabase client
        credentials = {}
        if req.email:
            credentials["email"] = req.email
        elif req.phone:
            credentials["phone"] = req.phone
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or Phone is required")
            
        credentials["password"] = req.password
        
        res = supabase_client.auth.sign_in_with_password(credentials)
        user_id = res.user.id
        access_token = res.session.access_token

        # Load profile
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if not profile:
            # Sync mismatch fallback
            profile = Profile(
                id=user_id,
                first_name=res.user.user_metadata.get("first_name", ""),
                last_name=res.user.user_metadata.get("last_name", ""),
                email=res.user.email,
                phone=res.user.phone,
                role=res.user.user_metadata.get("role", "customer")
            )
            db.add(profile)
            
            from app.models.interaction import Cart
            cart = Cart(id=user_id)
            db.add(cart)
            
            db.commit()
            db.refresh(profile)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "profile": profile
        }
    except Exception as e:
        logger.error(f"Supabase login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    """
    Verifies SMS registration or login OTP.
    """
    if is_supabase_placeholder():
        return {"success": True, "message": "OTP verification bypassed in local testing."}
        
    try:
        supabase_client.auth.verify_otp({
            "phone": req.phone,
            "token": req.token,
            "type": "sms"
        })
        return {"success": True, "message": "OTP verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/forgot-password")
def forgot_password(email: str):
    """
    Triggers password reset flow, sending reset email.
    """
    if is_supabase_placeholder():
        return {"success": True, "message": "Password reset email simulated successfully."}
        
    try:
        supabase_client.auth.reset_password_for_email(email)
        return {"success": True, "message": "Password reset instructions sent to email"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: Profile = Depends(get_current_user)):
    """
    Returns current authenticated user details.
    """
    return current_user


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changes password for currently authenticated user.
    """
    if is_supabase_placeholder():
        return {"success": True, "message": "Password changed successfully (mocked)."}
        
    try:
        supabase_client.auth.admin.update_user_by_id(
            str(current_user.id),
            {"password": req.new_password}
        )
        return {"success": True, "message": "Password changed successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to change password: {str(e)}"
        )


@router.post("/reset-password")
def reset_password(
    req: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Resets password using a JWT recovery token.
    """
    if is_supabase_placeholder():
        return {"success": True, "message": "Password reset successfully (mocked)."}
        
    try:
        if not req.token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required for password reset"
            )
            
        payload = decode_token(req.token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token subject")
            
        supabase_client.auth.admin.update_user_by_id(
            str(user_id),
            {"password": req.password}
        )
        return {"success": True, "message": "Password has been reset successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reset password: {str(e)}"
        )


@router.put("/me", response_model=ProfileResponse)
def update_profile(
    req: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated user's profile details.
    """
    if req.first_name is not None:
        current_user.first_name = req.first_name
    if req.last_name is not None:
        current_user.last_name = req.last_name
    if req.phone is not None:
        current_user.phone = req.phone
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/addresses", response_model=List[AddressResponse])
def list_addresses(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all shipping addresses for the authenticated user.
    """
    return db.query(Address).filter(Address.profile_id == current_user.id).all()


@router.post("/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    req: AddressCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new shipping/billing address for the authenticated user.
    """
    # If this address is set to default, unset other defaults
    if req.is_default:
        db.query(Address).filter(Address.profile_id == current_user.id).update({"is_default": False})
        
    address = Address(
        profile_id=current_user.id,
        title=req.title,
        address_line1=req.address_line1,
        address_line2=req.address_line2,
        city=req.city,
        state=req.state,
        postal_code=req.postal_code,
        country=req.country,
        is_default=req.is_default
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an address belonging to the authenticated user.
    """
    address = db.query(Address).filter(Address.id == address_id, Address.profile_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
        
    db.delete(address)
    db.commit()
    return {"success": True, "message": "Address deleted successfully"}


