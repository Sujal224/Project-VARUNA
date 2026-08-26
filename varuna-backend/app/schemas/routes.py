"""
Routes Pydantic Schemas
"""

from typing import List, Optional
from pydantic import BaseModel
from app.schemas.map import SafeRoute, Coordinates


class RouteCalculationRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    vessel_id: Optional[str] = None
    avoid_severe_weather: bool = True
