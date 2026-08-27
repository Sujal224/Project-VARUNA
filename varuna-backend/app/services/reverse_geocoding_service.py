"""
VARUNA High-Precision Asynchronous Reverse Geocoding Service
Resolves exact physical user location (City, Suburb, State, Country)
for GPS coordinates across land and maritime waters with resilient multi-tier fallbacks.
"""

import time
import logging
from typing import Dict, Tuple, Optional
import httpx
from app.schemas.location import ReverseGeocodedLocation
from app.utils.geo import format_coordinates_dms, get_marine_region_name, get_nearest_ocean
from app.services.marine_weather_client import PRESET_MARITIME_PORTS

logger = logging.getLogger(__name__)


class ReverseGeocodingService:
    def __init__(self, cache_ttl_seconds: int = 3600):
        self._cache: Dict[str, Tuple[float, ReverseGeocodedLocation]] = {}
        self.cache_ttl = cache_ttl_seconds
        self.headers = {
            "User-Agent": "VARUNA-Marine-Intelligence/2.0 (contact@varuna.marine; +https://varuna.marine.internal)",
            "Accept-Language": "en-US,en;q=0.9",
        }

    def _get_cache_key(self, lat: float, lon: float) -> str:
        # Snap coordinates to ~300m precision (3 decimal places)
        return f"{round(lat, 3)}_{round(lon, 3)}"

    async def get_location_details(self, lat: float, lon: float) -> ReverseGeocodedLocation:
        """
        Reverse geocodes coordinates to exact city/neighborhood and administrative region.
        Handles land, inshore ports, and open ocean sectors gracefully.
        """
        cache_key = self._get_cache_key(lat, lon)
        now = time.time()

        if cache_key in self._cache:
            ts, cached_result = self._cache[cache_key]
            if now - ts < self.cache_ttl:
                return cached_result

        formatted_coords = format_coordinates_dms(lat, lon)
        nearest_ocean = get_nearest_ocean(lat, lon)
        marine_sector = get_marine_region_name(lat, lon)

        # 1. Check if user is located directly at a major maritime port (~5km radius)
        for port in PRESET_MARITIME_PORTS:
            d_lat = abs(port["latitude"] - lat)
            d_lon = abs(port["longitude"] - lon)
            if d_lat < 0.045 and d_lon < 0.045:
                res = ReverseGeocodedLocation(
                    location_name=port["name"],
                    city=port["name"].replace(" Port", "").replace(" (JNPT)", ""),
                    suburb="Harbor & Terminal Zone",
                    state=port["region"],
                    country=port["country"],
                    region_name=f"{port['region']} • {nearest_ocean}",
                    nearest_ocean=nearest_ocean,
                    formatted_coordinates=formatted_coords,
                    is_maritime_water=True,
                    latitude=lat,
                    longitude=lon,
                )
                self._cache[cache_key] = (now, res)
                return res

        # 2. Query High-Accuracy OpenStreetMap Nominatim Reverse Geocoder
        try:
            async with httpx.AsyncClient(timeout=3.5, headers=self.headers) as client:
                response = await client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "format": "jsonv2",
                        "addressdetails": 1,
                        "zoom": 14,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    addr = data.get("address", {})

                    if addr:
                        # Extract most prominent city/locality name
                        city = (
                            addr.get("city")
                            or addr.get("town")
                            or addr.get("city_district")
                            or addr.get("municipality")
                            or addr.get("county")
                            or addr.get("village")
                            or addr.get("suburb")
                            or ""
                        )
                        suburb = addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential") or ""
                        state = addr.get("state") or addr.get("state_district") or addr.get("region") or ""
                        country = addr.get("country") or "India"

                        primary_name = city or suburb or data.get("name") or "Local Coastal Waters"
                        
                        region_desc = f"{state}, {country}" if state and country else (state or country or marine_sector)

                        res = ReverseGeocodedLocation(
                            location_name=primary_name,
                            city=city or primary_name,
                            suburb=suburb if suburb != primary_name else None,
                            state=state or None,
                            country=country,
                            region_name=f"{region_desc} • {nearest_ocean}",
                            nearest_ocean=nearest_ocean,
                            formatted_coordinates=formatted_coords,
                            is_maritime_water=False,
                            latitude=lat,
                            longitude=lon,
                        )
                        self._cache[cache_key] = (now, res)
                        return res
        except Exception as e:
            logger.info(f"[ReverseGeocoding] Nominatim query notice: {e}")

        # 3. Secondary Fallback: BigDataCloud Reverse Geocoding Client
        try:
            async with httpx.AsyncClient(timeout=3.0, headers=self.headers) as client:
                res_bdc = await client.get(
                    "https://api.bigdatacloud.net/data/reverse-geocode-client",
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "localityLanguage": "en",
                    },
                )
                if res_bdc.status_code == 200:
                    bdc_data = res_bdc.json()
                    if bdc_data and (bdc_data.get("city") or bdc_data.get("locality")):
                        city = bdc_data.get("city") or bdc_data.get("locality")
                        state = bdc_data.get("principalSubdivision") or ""
                        country = bdc_data.get("countryName") or "India"

                        res = ReverseGeocodedLocation(
                            location_name=city,
                            city=city,
                            suburb=bdc_data.get("locality") if bdc_data.get("locality") != city else None,
                            state=state,
                            country=country,
                            region_name=f"{state}, {country} • {nearest_ocean}" if state else f"{country} • {nearest_ocean}",
                            nearest_ocean=nearest_ocean,
                            formatted_coordinates=formatted_coords,
                            is_maritime_water=False,
                            latitude=lat,
                            longitude=lon,
                        )
                        self._cache[cache_key] = (now, res)
                        return res
        except Exception as bdc_err:
            logger.info(f"[ReverseGeocoding] BigDataCloud fallback notice: {bdc_err}")

        # 4. Maritime Waters Fallback (When coordinates are offshore in the sea/ocean)
        maritime_name = f"Offshore Sector ({formatted_coords})"
        res_maritime = ReverseGeocodedLocation(
            location_name=marine_sector,
            city=marine_sector,
            suburb="Maritime Nav Zone",
            state=marine_sector,
            country="Maritime Waters",
            region_name=f"{marine_sector} • {nearest_ocean}",
            nearest_ocean=nearest_ocean,
            formatted_coordinates=formatted_coords,
            is_maritime_water=True,
            latitude=lat,
            longitude=lon,
        )
        self._cache[cache_key] = (now, res_maritime)
        return res_maritime


reverse_geocoding_service = ReverseGeocodingService()
