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


def get_nearest_ocean(lat: float, lon: float) -> str:
    """
    Identify the nearest major ocean or sea body based on coordinates.
    Returns a human-friendly name like 'Bay of Bengal', 'Arabian Sea', 'Pacific Ocean'.
    """
    # === Indian Subcontinent Coastal Seas ===
    # Bay of Bengal (eastern coast of India + Sri Lanka + Bangladesh + Myanmar)
    if 0.0 <= lat <= 23.0 and 77.0 <= lon <= 100.0:
        return "Bay of Bengal"
    # Arabian Sea (western coast of India + Pakistan + Oman)
    if 0.0 <= lat <= 25.0 and 50.0 <= lon < 77.0:
        return "Arabian Sea"
    # Andaman Sea
    if 4.0 <= lat <= 20.0 and 92.0 <= lon <= 100.0:
        return "Andaman Sea"
    # Laccadive Sea (between India, Maldives, Sri Lanka)
    if 0.0 <= lat <= 14.0 and 70.0 <= lon <= 80.0:
        return "Laccadive Sea"

    # === Mediterranean & European Seas ===
    if 30.0 <= lat <= 46.0 and -6.0 <= lon <= 36.0:
        return "Mediterranean Sea"
    if 54.0 <= lat <= 62.0 and -4.0 <= lon <= 12.0:
        return "North Sea"
    if 53.0 <= lat <= 66.0 and 12.0 <= lon <= 30.0:
        return "Baltic Sea"
    if 40.0 <= lat <= 47.0 and 27.0 <= lon <= 42.0:
        return "Black Sea"

    # === Middle East & African Seas ===
    if 12.0 <= lat <= 30.0 and 32.0 <= lon <= 44.0:
        return "Red Sea"
    if 23.0 <= lat <= 30.5 and 46.0 <= lon <= 57.0:
        return "Persian Gulf"
    if -12.0 <= lat <= 12.0 and 38.0 <= lon <= 52.0:
        return "Gulf of Aden"

    # === East Asian Seas ===
    if 0.0 <= lat <= 23.0 and 99.0 <= lon <= 120.0:
        return "South China Sea"
    if 23.0 <= lat <= 41.0 and 117.0 <= lon <= 132.0:
        return "East China Sea"
    if 33.0 <= lat <= 52.0 and 127.0 <= lon <= 143.0:
        return "Sea of Japan"
    if -12.0 <= lat <= 8.0 and 95.0 <= lon <= 141.0:
        return "Java Sea"

    # === Americas ===
    if 9.0 <= lat <= 28.0 and -90.0 <= lon <= -60.0:
        return "Caribbean Sea"
    if 18.0 <= lat <= 31.0 and -100.0 <= lon <= -80.0:
        return "Gulf of Mexico"

    # === Major Oceans (broad catch-all) ===
    # Indian Ocean
    if -60.0 <= lat <= 30.0 and 20.0 <= lon <= 120.0:
        return "Indian Ocean"
    # North Pacific
    if 0.0 <= lat <= 60.0 and (120.0 <= lon <= 180.0 or -180.0 <= lon <= -100.0):
        return "North Pacific Ocean"
    # South Pacific
    if -60.0 <= lat < 0.0 and (120.0 <= lon <= 180.0 or -180.0 <= lon <= -70.0):
        return "South Pacific Ocean"
    # North Atlantic
    if 0.0 <= lat <= 60.0 and -100.0 <= lon <= 0.0:
        return "North Atlantic Ocean"
    # South Atlantic
    if -60.0 <= lat < 0.0 and -70.0 <= lon <= 20.0:
        return "South Atlantic Ocean"
    # Arctic
    if lat > 60.0:
        return "Arctic Ocean"
    # Southern / Antarctic
    if lat < -60.0:
        return "Southern Ocean"

    return "Open Ocean"


def get_marine_region_name(lat: float, lon: float) -> str:
    """
    Identify precise oceanic or coastal marine sector based on coordinates.
    Provides granular region names for Indian waters, falls back to nearest ocean globally.
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
    # Andaman & Nicobar
    elif 6.0 <= lat <= 14.0 and 91.0 <= lon <= 95.0:
        return "Andaman & Nicobar Marine Basin"
    # Lakshadweep
    elif 8.0 <= lat <= 12.5 and 71.0 <= lon <= 74.5:
        return "Lakshadweep Sea"
    else:
        # Fall back to global ocean detection
        return get_nearest_ocean(lat, lon)
