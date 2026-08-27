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


class ReverseGeocodedLocation(BaseModel):
    location_name: str = Field(..., description="Primary city or port display name e.g. Bengaluru or Visakhapatnam")
    city: Optional[str] = Field(None, description="City or town name")
    suburb: Optional[str] = Field(None, description="Neighborhood or suburb if applicable")
    state: Optional[str] = Field(None, description="State or administrative region")
    country: Optional[str] = Field(None, description="Country name")
    region_name: str = Field(..., description="Formatted regional descriptor e.g. Karnataka, India or Bay of Bengal")
    nearest_ocean: str = Field(..., description="Nearest ocean body e.g. Bay of Bengal or Arabian Sea")
    formatted_coordinates: str = Field(..., description="Formatted nautical coordinates (e.g. 12.97°N, 77.59°E)")
    is_maritime_water: bool = Field(False, description="True if offshore at sea, False if land/city")
    latitude: float
    longitude: float

