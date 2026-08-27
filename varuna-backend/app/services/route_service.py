"""
Route Service
"""

from typing import List
from app.schemas.map import SafeRoute, Coordinates
from app.schemas.routes import RouteCalculationRequest
from app.services.map_service import map_service
from app.schemas.map import MapIntelligenceRequest


class RouteService:
    async def calculate_route(self, req: RouteCalculationRequest) -> SafeRoute:
        intel = await map_service.get_map_intelligence(
            MapIntelligenceRequest(latitude=req.origin.latitude, longitude=req.origin.longitude)
        )
        return intel.safe_routes[0]


route_service = RouteService()
