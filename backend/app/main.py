import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import ZoningRuleModel
from backend.app.engine.zoning import HYDERABAD_ROAD_RULES
from backend.app.routers import health, zoning, sites, feasibility, scenarios

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Pre-seed Hyderabad road rules in DB if table is empty
    db = SessionLocal()
    try:
        if db.query(ZoningRuleModel).count() == 0:
            for rule in HYDERABAD_ROAD_RULES:
                z_rule = ZoningRuleModel(
                    jurisdiction="Hyderabad",
                    rule_name=f"Road {rule['min_road_width']}-{rule['max_road_width']}ft Rules",
                    road_width_min=rule["min_road_width"],
                    road_width_max=rule["max_road_width"] if rule["max_road_width"] < 1000 else None,
                    front_setback=rule["front_setback"],
                    rear_setback=rule["rear_setback"],
                    side_setback_left=rule["side_setback"],
                    side_setback_right=rule["side_setback"],
                    max_height=60.0,
                    max_far=rule["max_far"],
                    ground_coverage_max=0.60,
                    parking_ratio=500.0,
                    notes="Telangana Building Rules (GO 168 / GHMC preliminary norms)",
                )
                db.add(z_rule)
            db.commit()
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for SiteGen - Parametric Feasibility & Acquisition Intelligence Engine",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard root and healthz endpoints for cloud hosting (Render / K8s)
@app.get("/healthz", include_in_schema=False)
def render_healthz():
    return {"status": "ok"}

# Register API Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(zoning.router, prefix=settings.API_PREFIX)
app.include_router(sites.router, prefix=settings.API_PREFIX)
app.include_router(feasibility.router, prefix=settings.API_PREFIX)
app.include_router(scenarios.router, prefix=settings.API_PREFIX)

# If frontend build exists in production, serve it!
static_dist = settings.STATIC_DIR
if os.path.exists(static_dist) and os.path.exists(os.path.join(static_dist, "index.html")):
    assets_dir = os.path.join(static_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(static_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dist, "index.html"))

