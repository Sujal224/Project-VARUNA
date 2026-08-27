"""
Weather API Endpoints
"""

from typing import List
from fastapi import APIRouter, Query
from app.schemas.map import WeatherIntelligence, WeatherForecastItem
from app.services.weather_service import weather_service

router = APIRouter()


@router.get("/intelligence", response_model=WeatherIntelligence)
async def get_weather_intelligence(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
):
    return await weather_service.get_weather(lat, lng)


@router.get("/forecast", response_model=List[WeatherForecastItem])
async def get_weather_forecast(
    lat: float = Query(17.38, description="Latitude"),
    lng: float = Query(83.25, description="Longitude"),
):
    weather = await weather_service.get_weather(lat, lng)
    return weather.forecast
