"""
Safe Routes API Endpoints
"""

from typing import List
from fastapi import APIRouter, Body
from app.schemas.map import SafeRoute
from app.schemas.routes import RouteCalculationRequest
from app.services.route_service import route_service

router = APIRouter()


@router.post("/calculate", response_model=SafeRoute)
async def calculate_route(payload: RouteCalculationRequest = Body(...)):
    return await route_service.calculate_route(payload)


@router.get("/saved", response_model=List[SafeRoute])
def get_saved_routes():
    return []
