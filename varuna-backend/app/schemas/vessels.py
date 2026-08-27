"""
Pydantic Schemas for Live AIS Vessel Telemetry & Maritime Radar
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.map import Coordinates


class VesselCollisionRisk(BaseModel):
    level: str = Field("SAFE", description="SAFE | CAUTION | DANGER")
    cpa_nm: float = Field(..., description="Closest Point of Approach in nautical miles")
    tcpa_minutes: float = Field(..., description="Time to Closest Point of Approach in minutes")
    description: str


class VesselWaypoint(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    speed_knots: float


class VesselLiveItem(BaseModel):
    mmsi: str = Field(..., description="Maritime Mobile Service Identity (9-digit unique ID)")
    name: str = Field(..., description="Vessel Name")
    callsign: Optional[str] = "VT892"
    ship_type: str = Field(..., description="Vessel Classification (Fishing, Tanker, Cargo, etc.)")
    flag_country: str = Field("India", description="Country of Flag Registry")
    latitude: float
    longitude: float
    speed_knots: float = Field(..., description="Speed Over Ground (SOG)")
    course_deg: int = Field(..., description="Course Over Ground (COG)")
    heading_deg: int = Field(..., description="True Heading (0-359°)")
    nav_status: str = Field("Underway using engine", description="AIS Navigational Status")
    destination: str = Field("Port Clearance", description="Reported AIS Destination")
    eta: Optional[str] = "18:30 IST"
    length_m: float = Field(32.0, description="Vessel Length overall in meters")
    beam_m: float = Field(7.5, description="Vessel Beam width in meters")
    draught_m: float = Field(3.2, description="Vessel Draught in meters")
    distance_nm: float = Field(..., description="Distance from radar center / user vessel in NM")
    bearing_deg: int = Field(..., description="Relative bearing from radar center in degrees")
    collision_risk: VesselCollisionRisk
    last_ais_signal: str = Field("Live (3s ago)", description="AIS Transponder heartbeat latency")
    recent_track: Optional[List[VesselWaypoint]] = None


class VesselRadarResponse(BaseModel):
    origin_coordinates: Coordinates
    search_radius_nm: float
    total_vessels_tracked: int
    vessels: List[VesselLiveItem]
    nearest_vessel: Optional[VesselLiveItem] = None
    active_collision_warnings: int = 0
