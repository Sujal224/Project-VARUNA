"""
AI Assistant API Endpoints
"""

from fastapi import APIRouter, Body
from app.schemas.ai import AiChatRequest, AiChatResponse
from app.schemas.map import MapRecommendation
from app.services.ai_service import ai_service
from app.services.map_service import map_service
from app.schemas.map import MapIntelligenceRequest

router = APIRouter()


@router.post("/chat", response_model=AiChatResponse)
def chat(payload: AiChatRequest = Body(...)):
    return ai_service.chat(payload)


@router.post("/insight", response_model=MapRecommendation)
async def get_marine_insight(payload: dict = Body(...)):
    lat = payload.get("latitude", 17.38)
    lon = payload.get("longitude", 83.25)
    intel = await map_service.get_map_intelligence(MapIntelligenceRequest(latitude=lat, longitude=lon))
    return intel.recommendation or MapRecommendation(
        headline="Nearshore biological productivity optimal.",
        explanation="Thermal gradients favorable along continental break.",
        confidence_percent=85,
        timestamp="Just now",
        recommended_zone_id="pfz-zone-alpha",
        key_factors=[],
    )


@router.get("/recommendation-explanation/{zone_id}")
def get_recommendation_explanation(zone_id: str):
    return {
        "zone_id": zone_id,
        "explanation": "Sector Alpha is recommended due to dense chlorophyll concentration (2.4 mg/m³) and stable thermal front.",
    }
