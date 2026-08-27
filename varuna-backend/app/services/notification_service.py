"""
Notification Service
"""

from typing import List
from app.schemas.notifications import NotificationSchema


class NotificationService:
    def get_notifications(self) -> List[NotificationSchema]:
        return [
            NotificationSchema(
                id="notif-1",
                title="Cyclone Watch Advisory",
                body="Tropical low pressure system tracking 320nm SE. Coastal operations normal.",
                type="Cyclone Warning",
                severity="warning",
                timestamp="25m ago",
                read=False,
            ),
            NotificationSchema(
                id="notif-2",
                title="New High-Density PFZ Detected",
                body="MODIS pass confirmed Sector Alpha (Swatch Deep) chlorophyll front at 2.4 mg/m³.",
                type="New PFZ Detected",
                severity="success",
                timestamp="1h ago",
                read=False,
            ),
        ]


notification_service = NotificationService()
