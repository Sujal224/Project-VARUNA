"""
Pydantic Schemas for Location Search & Geocoding
"""

from typing import Optional
from pydantic import BaseModel, Field


class LocationSearchResult(BaseModel):
    id: str = Field(..., description="Unique location identifier")
    name: str = Field(..., description="City or port name")
    region: Optional[str] = Field(None, description="State, province, or ocean basin")
    country: Optional[str] = Field(None, description="Country name")
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")
    is_marine_port: bool = Field(False, description="Whether this is a major maritime port or coastal zone")
    formatted_coordinates: str = Field(..., description="Human-readable coordinates (e.g. 17.38°N, 83.25°E)")
    elevation_m: Optional[float] = Field(None, description="Elevation in meters")
    timezone: Optional[str] = Field(None, description="Timezone name")
