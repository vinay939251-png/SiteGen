from fastapi import APIRouter, Query
from backend.app.engine.zoning import get_zoning_rules, HYDERABAD_ROAD_RULES
from backend.app.schemas import ZoningRuleResponse

router = APIRouter(prefix="/zoning", tags=["Zoning"])

@router.get("/rules", response_model=ZoningRuleResponse)
def get_rules(
    jurisdiction: str = Query(default="Hyderabad", description="Target municipal jurisdiction"),
    road_width: float = Query(default=30.0, description="Abutting road width in feet"),
):
    rules = get_zoning_rules(jurisdiction, road_width)
    return ZoningRuleResponse(
        jurisdiction=rules["jurisdiction"],
        rule_name=f"{rules['jurisdiction']} Road {road_width}ft Rules",
        road_width_min=road_width,
        front_setback=rules["front_setback"],
        rear_setback=rules["rear_setback"],
        side_setback_left=rules["side_setback_left"],
        side_setback_right=rules["side_setback_right"],
        max_height=rules["max_height"],
        max_far=rules["max_far"],
        ground_coverage_max=0.60,
        parking_ratio=rules["parking_ratio"],
        notes="Based on Telangana Building Rules (GO 168 / GHMC preliminary norms)",
    )

@router.get("/tables")
def get_road_rules_table():
    return {
        "jurisdiction": "Hyderabad",
        "authority": "GHMC / HMDA",
        "road_rules": HYDERABAD_ROAD_RULES,
    }
