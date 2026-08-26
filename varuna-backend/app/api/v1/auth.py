"""
Authentication API Endpoints
"""

from fastapi import APIRouter, Depends, Body
from app.schemas.auth import (
    VerifyTokenRequest,
    RegisterUserRequest,
    UserProfile,
    UserSessionResponse,
)
from app.services.auth_service import auth_service
from app.core.security import get_current_user_claims

router = APIRouter()


@router.post("/verify", response_model=UserSessionResponse)
def verify_token(payload: VerifyTokenRequest = Body(...)):
    return auth_service.verify_token(payload.idToken)


@router.post("/register", response_model=UserProfile)
def register_user(payload: RegisterUserRequest = Body(...)):
    return auth_service.register(payload)


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(claims: dict = Depends(get_current_user_claims)):
    return UserProfile(
        uid=claims.get("uid", "vsl-captain-varuna-01"),
        email=claims.get("email", "captain@varunamarine.in"),
        displayName=claims.get("name", "Captain Ramesh V."),
        role=claims.get("role", "captain"),
        harborHomePort="Visakhapatnam Harbor Pier 4",
        licenseNumber="IND-DG-MAR-2024-8842",
    )


@router.post("/logout")
def logout():
    return {"success": True}
