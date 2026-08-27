"""
Weather Service
Fetches real-time oceanic weather and forecasts from the telemetry client.
"""

from app.schemas.map import WeatherIntelligence
from app.services.marine_weather_client import marine_weather_client


class WeatherService:
    async def get_weather(self, lat: float, lon: float) -> WeatherIntelligence:
        _, weather = await marine_weather_client.fetch_live_telemetry(lat, lon)
        return weather


weather_service = WeatherService()
