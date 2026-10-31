from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import SiteModel
from backend.app.schemas import CalculateFeasibilityRequest, CalculateFeasibilityResponse
from backend.app.engine.feasibility import calculate_feasibility

router = APIRouter(prefix="/feasibility", tags=["Feasibility"])

@router.post("/calculate", response_model=CalculateFeasibilityResponse)
def compute_feasibility(payload: CalculateFeasibilityRequest, db: Session = Depends(get_db)):
    width = payload.plot_width or 80.0
    depth = payload.plot_depth or 100.0
    plot_area_sqft = payload.plot_area_sqft or (width * depth)
    road_width = payload.road_width
    land_cost = payload.land_cost

    # If site_id is passed, pull saved geometry and road width from DB
    if payload.site_id is not None:
        site = db.query(SiteModel).filter(SiteModel.id == payload.site_id).first()
        if not site:
            raise HTTPException(status_code=404, detail="Referenced site_id not found")
        plot_area_sqft = site.area_sqft
        if site.width and site.depth:
            width = site.width
            depth = site.depth
        if site.road_width:
            road_width = site.road_width
        if site.land_price_total and not payload.land_cost:
            land_cost = site.land_price_total

    result = calculate_feasibility(
        plot_width=width,
        plot_depth=depth,
        plot_area_sqft=plot_area_sqft,
        road_width=road_width,
        typology=payload.typology,
        floors=payload.floors,
        floor_height=payload.floor_height,
        target_far=payload.target_far,
        efficiency=payload.efficiency,
        land_cost=land_cost,
        construction_cost_per_sqft=payload.construction_cost_per_sqft,
        selling_price_per_sqft=payload.selling_price_per_sqft,
        additional_cost_percent=payload.additional_cost_percent,
        parking_cost_per_space=payload.parking_cost_per_space,
    )
    return CalculateFeasibilityResponse(**result)

