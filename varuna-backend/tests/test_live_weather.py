"""
Live Marine Weather & Location Integration Test
"""

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_live_map_intelligence():
    # Test with Visakhapatnam Harbor coordinates (17.68°N, 83.21°E)
    payload = {
        "latitude": 17.68,
        "longitude": 83.21,
        "radius_km": 50,
    }
    response = client.post("/api/v1/map/intelligence", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Validate live conditions schema
    assert "conditions" in data
    assert "sea_temperature" in data["conditions"]
    assert "wave_height" in data["conditions"]
    assert "wave_speed" in data["conditions"]

    # Validate live weather schema
    assert "weather" in data
    assert "current" in data["weather"]
    assert "temperature_c" in data["weather"]["current"]
    assert "wind_speed_kmh" in data["weather"]["current"]
    assert "barometric_pressure_hpa" in data["weather"]["current"]
    assert len(data["weather"]["forecast"]) > 0

    print(f"\n[LIVE TELEMETRY VERIFIED]")
    print(f"Sea Surface Temp: {data['conditions']['sea_temperature']} C")
    print(f"Significant Wave Height: {data['conditions']['wave_height']}m")
    print(f"Wind Speed: {data['weather']['current']['wind_speed_kmh']} km/h")
    print(f"Atmospheric Pressure: {data['weather']['current']['barometric_pressure_hpa']} hPa")
    print(f"Condition: {data['weather']['current']['condition_text']}")


def test_live_weather_intelligence():
    response = client.get("/api/v1/weather/intelligence?lat=17.68&lng=83.21")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "forecast" in data
    assert data["current"]["temperature_c"] > 0
    print(f"Live Weather Intelligence verified successfully!")


if __name__ == "__main__":
    print("Running Live Marine Telemetry Tests...")
    test_live_map_intelligence()
    test_live_weather_intelligence()
    print("ALL TESTS PASSED WITH LIVE REAL-TIME DATA!")
