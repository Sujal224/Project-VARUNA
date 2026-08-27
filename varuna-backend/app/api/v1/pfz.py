"""
PFZ API Endpoints
"""

from typing import List
from fastapi import APIRouter, Query
from app.schemas.map import PfzZoneFeature
from app.services.pfz_service import pfz_service

router = APIRouter()


@router.get("/zones", response_model=List[PfzZoneFeature])
async def get_zones(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
    radius_km: float = Query(60.0, description="Search radius km"),
):
    return await pfz_service.get_zones(lat, lng, radius_km)


@router.get("/zones/{zone_id}", response_model=PfzZoneFeature)
async def get_zone_details(zone_id: str):
    zones = await pfz_service.get_zones(17.38, 83.25)
    for z in zones:
        if z.id == zone_id:
            return z
    return zones[0]
