"""
Firebase Admin SDK & Firestore Connection Manager
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

_firebase_initialized = False


def initialize_firebase() -> bool:
    """
    Initialize Firebase Admin SDK if credentials are provided.
    Gracefully handles local development when credentials are not yet configured.
    """
    global _firebase_initialized
    if _firebase_initialized:
        return True

    try:
        import firebase_admin
        from firebase_admin import credentials
        from app.core.config import settings

        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred, {
                "projectId": settings.FIREBASE_PROJECT_ID
            })
            _firebase_initialized = True
            logger.info("Firebase Admin initialized with service account.")
            return True
        else:
            logger.info("Firebase running in development mock mode (no service account path set).")
            return False
    except Exception as e:
        logger.warning(f"Firebase initialization skipped or failed: {e}")
        return False
