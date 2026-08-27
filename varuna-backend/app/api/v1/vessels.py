"""
Live AIS Vessel Radar API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.vessels import VesselRadarResponse, VesselLiveItem
from app.services.ais_service import ais_service

router = APIRouter()


@router.get("/radar", response_model=VesselRadarResponse)
async def get_vessel_radar(
    lat: float = Query(17.68, description="Center GPS Latitude"),
    lng: float = Query(83.21, description="Center GPS Longitude"),
    radius_nm: float = Query(35.0, description="Radar range in nautical miles"),
    speed_knots: float = Query(8.4, description="User vessel speed in knots"),
    course_deg: int = Query(120, description="User vessel heading/course in degrees"),
):
    """
    Returns real-time AIS traffic, kinematics, and CPA collision risk analysis.
    """
    return await ais_service.get_live_radar_vessels(
        center_lat=lat,
        center_lon=lng,
        radius_nm=radius_nm,
        user_speed_knots=speed_knots,
        user_course_deg=course_deg,
    )


@router.get("/{mmsi}", response_model=VesselLiveItem)
async def get_vessel_details(
    mmsi: str,
    lat: float = Query(17.68, description="Reference Latitude"),
    lng: float = Query(83.21, description="Reference Longitude"),
):
    """
    Fetches full AIS transponder profile and navigation status for a specific MMSI.
    """
    vessel = await ais_service.get_vessel_by_mmsi(mmsi, ref_lat=lat, ref_lon=lng)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel with specified MMSI not found")
    return vessel
