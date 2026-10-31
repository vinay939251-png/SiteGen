from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class Point2D(BaseModel):
    x: float
    y: float

class SiteBase(BaseModel):
    name: str = Field(default="Hyderabad Plot")
    address: str
    latitude: float
    longitude: float
    boundary: List[Dict[str, float]]
    area_sqft: float
    area_sqm: float
    perimeter: Optional[float] = None
    width: Optional[float] = None
    depth: Optional[float] = None
    road_width: float = 30.0
    land_price_total: Optional[float] = None

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ZoningRuleResponse(BaseModel):
    id: Optional[int] = None
    jurisdiction: str
    rule_name: str
    road_width_min: float
    road_width_max: Optional[float] = None
    front_setback: float
    rear_setback: float
    side_setback_left: float
    side_setback_right: float
    max_height: float
    max_far: float
    ground_coverage_max: float
    parking_ratio: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class CalculateFeasibilityRequest(BaseModel):
    site_id: Optional[int] = None
    plot_width: Optional[float] = 80.0
    plot_depth: Optional[float] = 100.0
    plot_area_sqft: Optional[float] = 8000.0
    road_width: float = 30.0
    typology: str = "Apartment"
    floors: int = 8
    floor_height: float = 3.2
    target_far: float = 2.5
    efficiency: float = 0.80
    land_cost: float = 20000000.0
    construction_cost_per_sqft: float = 2200.0
    selling_price_per_sqft: float = 6500.0
    additional_cost_percent: float = 8.0
    parking_cost_per_space: float = 200000.0


class FeasibilityIndicator(BaseModel):
    name: str
    status: str  # "PASS" | "WARN" | "FAIL"
    message: str
    value: str


class CalculateFeasibilityResponse(BaseModel):
    plot_area_sqft: float
    plot_area_sqm: float
    buildable_footprint_sqft: float
    buildable_footprint_sqm: float
    ground_coverage_percent: float
    gross_floor_area_sqft: float
    saleable_area_sqft: float
    floors: int
    building_height_m: float
    max_permissible_height_m: float
    achieved_far: float
    max_permissible_far: float
    parking_spaces: int
    setbacks: Dict[str, float]
    costs: Dict[str, float]
    estimated_revenue: float
    estimated_profit: float
    margin_percent: float
    roi_percent: float
    indicators: List[FeasibilityIndicator]


class ScenarioCreate(BaseModel):
    id: Optional[str] = None
    site_id: Optional[int] = None
    name: str
    typology: str = "Apartment"
    floors: int = 8
    floor_height: float = 3.2
    target_far: float = 2.5
    efficiency: float = 0.80
    land_cost: float = 0.0
    construction_cost_per_sqft: float = 2200.0
    selling_price_per_sqft: float = 6500.0
    additional_cost_percent: float = 8.0
    site_snapshot: Optional[Dict[str, Any]] = None
    feasibility_result: Dict[str, Any]


class ScenarioResponse(BaseModel):
    id: str
    site_id: Optional[int] = None
    name: str
    typology: str
    floors: int
    floor_height: float
    target_far: float
    efficiency: float
    land_cost: float
    construction_cost_per_sqft: float
    selling_price_per_sqft: float
    additional_cost_percent: float
    site_snapshot: Optional[Dict[str, Any]] = None
    feasibility_result: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
