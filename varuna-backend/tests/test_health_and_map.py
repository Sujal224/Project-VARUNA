"""
Unit & Integration Tests for VARUNA Backend
"""

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "VARUNA API"
    print("[PASS] Root endpoint test passed")


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "VARUNA API"
    print("[PASS] Health endpoint test passed")


def test_map_intelligence_endpoint():
    payload = {
        "latitude": 17.38,
        "longitude": 83.25,
        "radius_km": 50,
    }
    response = client.post("/api/v1/map/intelligence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "user_location" in data
    assert "conditions" in data
    assert "weather" in data
    assert "pfz" in data
    assert "risk" in data
    assert "safe_routes" in data
    assert "alerts" in data
    assert len(data["pfz"]["zones"]) >= 1
    print("[PASS] Map intelligence endpoint test passed")


def test_search_locations_endpoint():
    # 1. Preset / empty search
    res1 = client.get("/api/v1/map/search-locations")
    assert res1.status_code == 200
    data1 = res1.json()
    assert len(data1) >= 1
    assert any(item["name"] == "Visakhapatnam Port" for item in data1)

    # 2. Text search for a port/city
    res2 = client.get("/api/v1/map/search-locations?query=Mumbai")
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2) >= 1
    assert "Mumbai" in data2[0]["name"]

    # 3. Direct Coordinate query
    res3 = client.get("/api/v1/map/search-locations?query=17.38, 83.25")
    assert res3.status_code == 200
    data3 = res3.json()
    assert len(data3) == 1
    assert data3[0]["latitude"] == 17.38
    assert data3[0]["longitude"] == 83.25
    print("[PASS] Search locations endpoint test passed")


if __name__ == "__main__":
    print("Running Health, Map & Search Integration Tests...")
    test_root_endpoint()
    test_health_endpoint()
    test_search_locations_endpoint()
    test_map_intelligence_endpoint()
    print("ALL TESTS PASSED!")

