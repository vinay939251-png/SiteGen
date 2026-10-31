from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "jurisdiction": "Hyderabad (GHMC / HMDA)",
    }
