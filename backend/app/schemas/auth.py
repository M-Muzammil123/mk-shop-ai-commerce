from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class AddressBase(BaseModel):
    title: str = Field("Home", max_length=50)
    address_line1: str
    address_line2: Optional[str] = None
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=20)
    country: str = Field(..., max_length=100)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    id: UUID
    profile_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"


class ProfileResponse(ProfileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone: Optional[str] = None
    role: Optional[str] = "customer"


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    phone: str
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile: ProfileResponse


class ResetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=6)
    token: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6)

