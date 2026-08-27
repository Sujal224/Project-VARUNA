"""
Unit Tests for Satellite Ocean Physics & PFZ Intelligence Engine
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
from app.services.satellite_ocean_client import satellite_ocean_client, OceanTelemetryGridPoint
from app.intelligence.pfz.detector import pfz_detector


def test_pfz_detector_algorithm():
    user_lat = 17.68
    user_lon = 83.21

    # Simulate 2D telemetry grid points around Visakhapatnam
    mock_grid = [
        OceanTelemetryGridPoint(
            lat=17.68,
            lon=83.21,
            sst_c=28.4,
            current_speed_knots=1.1,
            current_direction_deg=135,
            wave_height_m=1.2,
            chlorophyll_mg_m3=2.1,
        ),
        OceanTelemetryGridPoint(
            lat=17.80,
            lon=83.35,
            sst_c=27.2,  # Strong thermal front drop (1.2°C delta)
            current_speed_knots=2.1,
            current_direction_deg=160,
            wave_height_m=1.4,
            chlorophyll_mg_m3=3.4,  # High chlorophyll concentration
        ),
        OceanTelemetryGridPoint(
            lat=17.95,
            lon=83.45,
            sst_c=26.8,
            current_speed_knots=1.8,
            current_direction_deg=150,
            wave_height_m=1.5,
            chlorophyll_mg_m3=2.8,
        ),
    ]

    zones = pfz_detector.detect_potential_fishing_zones(
        user_lat=user_lat,
        user_lon=user_lon,
        grid_points=mock_grid,
        region_name="Bay of Bengal (Visakhapatnam Shelf)",
    )

    assert len(zones) >= 1
    top_zone = zones[0]

    # Verify attributes
    assert top_zone.probability in ["High", "Moderate"]
    assert top_zone.confidence_percent >= 60
    assert len(top_zone.target_species) > 0
    assert top_zone.chlorophyll_mg_m3 > 0
    assert top_zone.sea_temp_c > 0
    assert len(top_zone.boundary_polygon) >= 4
    # Verify polygon is closed
    assert top_zone.boundary_polygon[0].latitude == top_zone.boundary_polygon[-1].latitude
    assert top_zone.boundary_polygon[0].longitude == top_zone.boundary_polygon[-1].longitude
    assert top_zone.distance_nm > 0

    print(f"[PASS] PFZ Detector test passed: {top_zone.name} with {top_zone.confidence_percent}% confidence")
    print(f"       Target Species: {', '.join(top_zone.target_species)}")
    print(f"       Boundary Vertices: {len(top_zone.boundary_polygon)} points")


async def test_live_satellite_ocean_client():
    lat = 18.95
    lon = 72.85  # Mumbai Coast

    # 1. Fetch live ocean dynamics
    physics = await satellite_ocean_client.fetch_live_ocean_physics(lat, lon)
    assert "current_speed_knots" in physics
    assert "current_direction_deg" in physics
    assert "swell_period_sec" in physics
    assert "salinity_psu" in physics
    print(f"[PASS] Live ocean physics verified for Mumbai: {physics['current_speed_knots']} kts current, {physics['swell_period_sec']}s swell")

    # 2. Fetch spatial grid
    grid = await satellite_ocean_client.fetch_spatial_telemetry_grid(lat, lon)
    assert len(grid) >= 9
    assert all(isinstance(p, OceanTelemetryGridPoint) for p in grid)
    print(f"[PASS] Spatial ocean telemetry grid generated: {len(grid)} spatial points")


if __name__ == "__main__":
    print("Running Satellite Ocean Physics & PFZ Detector Tests...")
    test_pfz_detector_algorithm()
    asyncio.run(test_live_satellite_ocean_client())
    print("ALL SATELLITE PFZ TESTS PASSED!")
