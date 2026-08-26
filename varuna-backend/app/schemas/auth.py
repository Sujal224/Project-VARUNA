"""
Authentication Schemas
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    displayName: Optional[str] = None
    phoneNumber: Optional[str] = None
    photoURL: Optional[str] = None
    role: str = "captain"
    harborHomePort: Optional[str] = None
    licenseNumber: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class VerifyTokenRequest(BaseModel):
    idToken: str


class RegisterUserRequest(BaseModel):
    idToken: str
    displayName: str
    role: str = "captain"
    harborHomePort: Optional[str] = None
    licenseNumber: Optional[str] = None


class UserSessionResponse(BaseModel):
    user: Optional[UserProfile] = None
    idToken: Optional[str] = None
    isAuthenticated: bool = True
