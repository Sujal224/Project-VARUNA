"""
Pydantic Schemas for Map Intelligence
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class MarineConditions(BaseModel):
    sea_temperature: float = Field(..., description="Sea surface temperature in Celsius")
    wave_height: float = Field(..., description="Significant wave height in meters")
    wave_speed: float = Field(..., description="Wave or surface wind speed in km/h")
    chlorophyll: float = Field(..., description="Chlorophyll-a concentration in mg/m3")
    swell_direction_deg: Optional[int] = 135
    swell_period_sec: Optional[int] = 9
    wind_direction_deg: Optional[int] = 120
    salinity_psu: Optional[float] = 34.8
    current_speed_knots: Optional[float] = 1.4
    surface_visibility_km: Optional[float] = 18.0


class WeatherForecastItem(BaseModel):
    timestamp: str
    time_label: str
    temp_c: float
    wave_height_m: float
    wind_speed_kmh: float
    precipitation_probability: int
    condition: str
    icon: str


class WeatherConditionItem(BaseModel):
    temperature_c: float
    humidity_percent: int
    barometric_pressure_hpa: int
    wind_speed_kmh: float
    wind_gust_kmh: float
    condition_text: str
    icon: str
    uv_index: int
    visibility_km: float


class WeatherIntelligence(BaseModel):
    current: WeatherConditionItem
    forecast: List[WeatherForecastItem]
    sunrise: Optional[str] = "05:42 AM"
    sunset: Optional[str] = "06:18 PM"
    tide_state: Optional[str] = "High Flood"


class PfzZoneFeature(BaseModel):
    id: str
    name: str
    coordinates: Coordinates
    probability: str  # High | Moderate | Low
    confidence_percent: int
    target_species: List[str]
    depth_meters: int
    chlorophyll_mg_m3: float
    sea_temp_c: float
    optimal_time_window: str
    distance_nm: float
    bearing_deg: int
    boundary_polygon: List[Coordinates]


class PfzIntelligence(BaseModel):
    zones: List[PfzZoneFeature]
    last_satellite_pass: Optional[str] = "MODIS Ocean Color Pass"


class RiskFactor(BaseModel):
    name: str
    score: int
    severity: str
    description: str


class RiskAssessment(BaseModel):
    score: int
    level: str  # LOW | MODERATE | HIGH | CRITICAL
    summary: str
    factors: List[RiskFactor]


class SafeRouteWaypoint(BaseModel):
    latitude: float
    longitude: float
    sequence: int
    depth_m: Optional[int] = None
    risk_level: Optional[str] = "safe"
    notes: Optional[str] = None


class SafeRoute(BaseModel):
    id: str
    name: str
    distance_nm: float
    estimated_duration_hours: float
    fuel_estimated_liters: float
    safety_score: int
    waypoints: List[SafeRouteWaypoint]
    is_recommended: bool = True


class MapAlertItem(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    location_name: str
    coordinates: Optional[Coordinates] = None
    timestamp: str
    description: str
    impact_explanation: str
    recommended_action: str
    active: bool = True


class RecommendationFactor(BaseModel):
    name: str
    score: int
    description: str
    sentiment: str


class MapRecommendation(BaseModel):
    headline: str
    explanation: str
    confidence_percent: int
    timestamp: str
    recommended_zone_id: str
    key_factors: List[RecommendationFactor]


class MapIntelligenceRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: Optional[float] = 50.0
    target_species: Optional[List[str]] = None
    vessel_id: Optional[str] = None


class MapIntelligenceResponse(BaseModel):
    user_location: Coordinates
    location_name: str = Field("Live Vessel GPS", description="Primary detected location or city name")
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_maritime_water: bool = False
    region_name: str
    nearest_ocean: str
    conditions: MarineConditions
    weather: WeatherIntelligence
    pfz: PfzIntelligence
    risk: RiskAssessment
    safe_routes: List[SafeRoute]
    alerts: List[MapAlertItem]
    recommendation: Optional[MapRecommendation] = None


