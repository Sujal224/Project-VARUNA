"""
Unit & Integration Tests for Live AIS Vessel Radar & Collision Risk System
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.services.ais_service import ais_service

client = TestClient(app)


def test_vessel_radar_endpoint():
    # Visakhapatnam Port Reference
    lat, lng = 17.68, 83.21
    response = client.get(f"/api/v1/vessels/radar?lat={lat}&lng={lng}&radius_nm=45&speed_knots=8.5&course_deg=110")
    assert response.status_code == 200
    data = response.json()

    assert "origin_coordinates" in data
    assert data["origin_coordinates"]["latitude"] == lat
    assert data["origin_coordinates"]["longitude"] == lng
    assert "vessels" in data
    assert len(data["vessels"]) >= 3
    assert "total_vessels_tracked" in data
    assert data["total_vessels_tracked"] >= 3
    assert "nearest_vessel" in data
    assert data["nearest_vessel"] is not None

    # Inspect the nearest vessel
    v = data["vessels"][0]
    assert "mmsi" in v
    assert "name" in v
    assert "speed_knots" in v
    assert "course_deg" in v
    assert "collision_risk" in v
    assert v["collision_risk"]["level"] in ["SAFE", "CAUTION", "DANGER"]
    assert "cpa_nm" in v["collision_risk"]
    assert "tcpa_minutes" in v["collision_risk"]
    assert len(v["recent_track"]) >= 1

    print(f"[PASS] AIS Radar Endpoint Verified: {len(data['vessels'])} active vessels tracked within 45 NM")
    print(f"       Nearest Vessel: {v['name']} ({v['ship_type']}) at {v['distance_nm']} NM | Risk: {v['collision_risk']['level']}")


def test_vessel_details_endpoint():
    # Fetch RV Samudra Ratnakar
    mmsi = "419008761"
    response = client.get(f"/api/v1/vessels/{mmsi}?lat=17.68&lng=83.21")
    assert response.status_code == 200
    data = response.json()
    assert data["mmsi"] == mmsi
    assert "Samudra Ratnakar" in data["name"]
    assert data["ship_type"] == "Oceanographic Research Vessel"
    print(f"[PASS] Specific Vessel Profile Verified for MMSI {mmsi}: {data['name']}")


def test_cpa_collision_calculation():
    # Head-on collision simulation
    # User at (17.0, 83.0), heading North (0 deg) at 10 kts
    # Target at (17.1, 83.0), heading South (180 deg) at 10 kts
    cpa_nm, tcpa_min, level, desc = ais_service._calculate_cpa(
        user_lat=17.0,
        user_lon=83.0,
        user_speed_knots=10.0,
        user_course_deg=0,
        target_lat=17.1,
        target_lon=83.0,
        target_speed_knots=10.0,
        target_course_deg=180,
    )
    assert cpa_nm < 0.1  # Direct collision course
    assert tcpa_min > 0  # In future
    assert level == "DANGER"
    print(f"[PASS] Collision CPA calculation verified: CPA={cpa_nm} NM, TCPA={tcpa_min} min, Risk={level}")


if __name__ == "__main__":
    print("Running AIS Vessel Radar Tests...")
    test_vessel_radar_endpoint()
    test_vessel_details_endpoint()
    test_cpa_collision_calculation()
    print("ALL AIS RADAR TESTS PASSED!")
