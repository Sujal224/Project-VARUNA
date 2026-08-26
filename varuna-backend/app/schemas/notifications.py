"""
Notifications Pydantic Schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class NotificationSchema(BaseModel):
    id: str
    title: str
    body: str
    type: str
    severity: str
    timestamp: str
    read: bool = False
    data: Optional[Dict[str, Any]] = None


class RegisterDeviceRequest(BaseModel):
    push_token: str
    platform: str = "expo"
