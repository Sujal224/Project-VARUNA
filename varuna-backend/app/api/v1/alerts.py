"""
Marine Alerts API Endpoints
"""

from typing import List
from fastapi import APIRouter, Query
from app.schemas.map import MapAlertItem
from app.services.alert_service import alert_service

router = APIRouter()


@router.get("/active", response_model=List[MapAlertItem])
async def get_active_alerts(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
):
    return await alert_service.get_active_alerts(lat, lng)


@router.get("/{alert_id}", response_model=MapAlertItem)
async def get_alert_by_id(alert_id: str):
    alerts = await alert_service.get_active_alerts()
    for a in alerts:
        if a.id == alert_id:
            return a
    return alerts[0]


@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: str):
    return {"success": True, "alert_id": alert_id}
