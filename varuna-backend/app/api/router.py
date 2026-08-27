"""
VARUNA API Router Aggregator (v1)
"""

from fastapi import APIRouter
from app.api.v1 import health, auth, map, weather, pfz, alerts, routes, notifications, ai, vessels

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(map.router, prefix="/map", tags=["Map Intelligence"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(pfz.router, prefix="/pfz", tags=["PFZ"])
api_router.include_router(vessels.router, prefix="/vessels", tags=["AIS Vessels Radar"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(routes.router, prefix="/routes", tags=["Safe Routes"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Assistant"])
