"""
Weather Service
Fetches real-time oceanic weather and passes it through
the VARUNA weather intelligence engine.
"""

from app.schemas.map import WeatherIntelligence
from app.services.marine_weather_client import marine_weather_client
from app.intelligence.weather.analyzer import weather_analyzer


class WeatherService:

    async def get_weather(
        self,
        lat: float,
        lon: float
    ) -> WeatherIntelligence:

        conditions, weather = (
            await marine_weather_client.fetch_live_telemetry(
                lat,
                lon
            )
        )

        return weather_analyzer.analyze(
            weather=weather,
            wave_height=conditions.wave_height,
        )


weather_service = WeatherService()