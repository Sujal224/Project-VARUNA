"""
Geospatial Calculations & Marine Region Detection Utilities
"""

import math
from typing import Tuple, Dict, Any


def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points in Nautical Miles (nm).
    """
    R_NM = 3440.065

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R_NM * c, 2)


def calculate_bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """
    Calculate initial bearing from point 1 to point 2 in degrees (0-360).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(
        delta_lambda
    )

    initial_bearing = math.atan2(y, x)
    compass_bearing = (math.degrees(initial_bearing) + 360) % 360
    return int(round(compass_bearing))


def format_coordinates_dms(lat: float, lon: float) -> str:
    """
    Format decimal degrees to readable nautical string e.g. 17.38°N, 83.25°E
    """
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{lat_dir}, {abs(lon):.2f}°{lon_dir}"


def get_marine_region_name(lat: float, lon: float) -> str:
    """
    Identify precise oceanic or coastal marine sector based on coordinates.
    """
    # Visakhapatnam & Northern Andhra Coast
    if 16.5 <= lat <= 18.5 and 82.0 <= lon <= 85.0:
        return "Visakhapatnam & North Andhra Shelf"
    # Chennai & Coromandel Coast
    elif 11.5 <= lat <= 14.5 and 79.5 <= lon <= 82.0:
        return "Chennai & Coromandel Coast"
    # Mumbai & Maharashtra Coast
    elif 18.0 <= lat <= 20.5 and 71.0 <= lon <= 74.0:
        return "Mumbai & Maharashtra Offshore Shelf"
    # Kochi & Kerala Coast
    elif 8.0 <= lat <= 11.5 and 75.0 <= lon <= 77.5:
        return "Kochi & Malabar Marine Shelf"
    # Goa & Konkan Coast
    elif 14.5 <= lat <= 16.5 and 72.5 <= lon <= 74.5:
        return "Goa & Konkan Coastal Sector"
    # Gujarat & Gulf of Kutch / Khambhat
    elif 20.5 <= lat <= 24.0 and 68.0 <= lon <= 73.0:
        return "Gujarat & Gulf of Khambhat"
    # Odisha & Paradip
    elif 18.5 <= lat <= 21.5 and 84.0 <= lon <= 88.0:
        return "Odisha & Paradip Marine Basin"
    # Bengal Swatch & Sundarbans
    elif 21.0 <= lat <= 23.5 and 87.0 <= lon <= 90.0:
        return "Bengal Basin & Swatch of No Ground"
    # Tamil Nadu / Palk Strait
    elif 8.5 <= lat <= 11.5 and 78.0 <= lon <= 80.0:
        return "Gulf of Mannar & Palk Bay"
    # General Arabian Sea
    elif lon < 77.0 and 0.0 <= lat <= 25.0:
        return "Arabian Sea Oceanic Sector"
    # General Bay of Bengal
    elif lon >= 77.0 and 0.0 <= lat <= 25.0:
        return "Bay of Bengal Marine Sector"
    else:
        return f"Sector {abs(lat):.1f}°{ 'N' if lat>=0 else 'S' }, {abs(lon):.1f}°{ 'E' if lon>=0 else 'W' }"
