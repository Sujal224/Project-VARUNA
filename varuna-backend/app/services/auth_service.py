"""
Authentication Service
"""

from typing import Dict, Any
from app.schemas.auth import UserProfile, UserSessionResponse, RegisterUserRequest


class AuthService:
    def verify_token(self, token: str) -> UserSessionResponse:
        user = UserProfile(
            uid="vsl-captain-varuna-01",
            email="captain.ramesh@varunamarine.in",
            displayName="Captain Ramesh V.",
            phoneNumber="+91 98480 22334",
            photoURL="https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80",
            role="captain",
            harborHomePort="Visakhapatnam Harbor Pier 4",
            licenseNumber="IND-DG-MAR-2024-8842",
            createdAt="2026-01-15T00:00:00Z",
        )
        return UserSessionResponse(user=user, idToken=token, isAuthenticated=True)

    def register(self, req: RegisterUserRequest) -> UserProfile:
        return UserProfile(
            uid="uid_new_user",
            email="user@varunamarine.in",
            displayName=req.displayName,
            role=req.role,
            harborHomePort=req.harborHomePort,
            licenseNumber=req.licenseNumber,
        )


auth_service = AuthService()
