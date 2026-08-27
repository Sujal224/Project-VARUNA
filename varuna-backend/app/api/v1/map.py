"""
Map Intelligence API Endpoints
"""

from typing import List
from fastapi import APIRouter, Query, Body
from app.schemas.map import (
    MapIntelligenceRequest,
    MapIntelligenceResponse,
    PfzZoneFeature,
    MarineConditions,
    SafeRoute,
    MapAlertItem,
)
from app.schemas.location import LocationSearchResult
from app.schemas.routes import RouteCalculationRequest
from app.services.map_service import map_service

router = APIRouter()


@router.get("/search-locations", response_model=List[LocationSearchResult])
async def search_locations(
    query: str = Query("", description="Location name, port, city, or coordinates (e.g. 17.38, 83.25)"),
    limit: int = Query(8, ge=1, le=20, description="Max results to return"),
):
    """
    Search global locations, coastal cities, and major maritime ports.
    Supports text search (Open-Meteo Geocoding) and direct latitude/longitude parsing.
    """
    return await map_service.search_locations(query=query, limit=limit)



@router.post("/intelligence", response_model=MapIntelligenceResponse)
async def get_map_intelligence(payload: MapIntelligenceRequest = Body(...)):
    """
    Primary Map Intelligence Contract
    Calculates live ocean physics, PFZ clusters, weather forecasts, navigation corridors,
    and hazard alerts for the specified nautical coordinates.
    """
    return await map_service.get_map_intelligence(payload)


@router.get("/pfz-zones", response_model=List[PfzZoneFeature])
async def get_pfz_zones(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
    radius_km: float = Query(50.0, description="Search radius in kilometers"),
):
    intel = await map_service.get_map_intelligence(
        MapIntelligenceRequest(latitude=lat, longitude=lng, radius_km=radius_km)
    )
    return intel.pfz.zones


@router.get("/conditions", response_model=MarineConditions)
async def get_marine_conditions(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
):
    intel = await map_service.get_map_intelligence(
        MapIntelligenceRequest(latitude=lat, longitude=lng)
    )
    return intel.conditions


@router.post("/safe-routes", response_model=List[SafeRoute])
async def calculate_safe_routes(payload: RouteCalculationRequest = Body(...)):
    intel = await map_service.get_map_intelligence(
        MapIntelligenceRequest(latitude=payload.origin.latitude, longitude=payload.origin.longitude)
    )
    return intel.safe_routes


@router.get("/alerts", response_model=List[MapAlertItem])
async def get_nearby_alerts(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
    radius_km: float = Query(100.0, description="Search radius in kilometers"),
):
    intel = await map_service.get_map_intelligence(
        MapIntelligenceRequest(latitude=lat, longitude=lng, radius_km=radius_km)
    )
    return intel.alerts
