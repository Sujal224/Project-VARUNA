"""Quick ocean detection verification across global coordinates"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.utils.geo import get_nearest_ocean, get_marine_region_name

tests = [
    (17.38, 83.25, "Visakhapatnam"),
    (19.07, 72.87, "Mumbai"),
    (9.96, 76.26, "Kochi"),
    (13.08, 80.29, "Chennai"),
    (52.52, 13.41, "Berlin"),
    (25.27, 51.52, "Doha/Qatar"),
    (40.71, -74.00, "New York"),
    (35.68, 139.69, "Tokyo"),
    (-33.87, 151.21, "Sydney"),
    (21.31, -157.86, "Honolulu"),
    (1.35, 103.82, "Singapore"),
    (51.51, -0.13, "London"),
]

print("=" * 70)
print(f"{'Location':<18} {'Region':<38} {'Ocean'}")
print("=" * 70)
for lat, lon, label in tests:
    region = get_marine_region_name(lat, lon)
    ocean = get_nearest_ocean(lat, lon)
    print(f"{label:<18} {region:<38} {ocean}")
print("=" * 70)
print("ALL OCEAN DETECTION CHECKS COMPLETE")
