"""
VARUNA — Backend Main Application Entrypoint
FastAPI + Firebase + Firestore + GCP Marine Intelligence Architecture
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.api.router import api_router

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    initialize_firebase()


@app.get("/")
def root_endpoint():
    return {
        "status": "healthy",
        "service": "VARUNA API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VARUNA API",
    }


# Mount API v1 Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
