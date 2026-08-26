"""
PFZ Service
"""

from typing import List
from app.schemas.map import PfzZoneFeature, MapIntelligenceRequest
from app.services.map_service import map_service


class PfzService:
    async def get_zones(self, lat: float, lon: float, radius_km: float = 60.0) -> List[PfzZoneFeature]:
        intel = await map_service.get_map_intelligence(
            MapIntelligenceRequest(latitude=lat, longitude=lon, radius_km=radius_km)
        )
        return intel.pfz.zones


pfz_service = PfzService()
