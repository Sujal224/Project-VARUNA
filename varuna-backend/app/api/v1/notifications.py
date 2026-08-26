"""
Notifications API Endpoints
"""

from typing import List
from fastapi import APIRouter, Body
from app.schemas.notifications import NotificationSchema, RegisterDeviceRequest
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("", response_model=List[NotificationSchema])
def get_notifications():
    return notification_service.get_notifications()


@router.post("/register-device")
def register_device(payload: RegisterDeviceRequest = Body(...)):
    return {"success": True, "token": payload.push_token}


@router.post("/{notification_id}/read")
def mark_read(notification_id: str):
    return {"success": True, "id": notification_id}
