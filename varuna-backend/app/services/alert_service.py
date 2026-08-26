"""
Alert Service
"""

from typing import List
from app.schemas.map import MapAlertItem, MapIntelligenceRequest
from app.services.map_service import map_service


class AlertService:
    async def get_active_alerts(self, lat: float = 17.38, lon: float = 83.25) -> List[MapAlertItem]:
        intel = await map_service.get_map_intelligence(MapIntelligenceRequest(latitude=lat, longitude=lon))
        return intel.alerts


alert_service = AlertService()
