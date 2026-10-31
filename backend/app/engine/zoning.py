"""
Zoning Rules Engine for Hyderabad (Telangana Building Rules / GHMC norms).
"""
from typing import Dict, Any, List

HYDERABAD_DEFAULT_RULES = {
    "jurisdiction": "Hyderabad",
    "authority": "GHMC / HMDA",
    "regulation_profile": "GHMC / HMDA Preliminary",
    "front_setback": 10.0,
    "rear_setback": 5.0,
    "side_setback_left": 5.0,
    "side_setback_right": 5.0,
    "max_height": 60.0,  # meters
    "max_far": 2.5,
    "parking_ratio": 500.0,  # 1 space per 500 sqft saleable area
    "is_verified": False,
}

HYDERABAD_ROAD_RULES = [
    {"min_road_width": 0.0,  "max_road_width": 20.0, "front_setback": 6.0,  "side_setback": 3.0,  "rear_setback": 3.0,  "max_far": 1.75},
    {"min_road_width": 20.0, "max_road_width": 30.0, "front_setback": 8.0,  "side_setback": 4.0,  "rear_setback": 4.0,  "max_far": 2.0},
    {"min_road_width": 30.0, "max_road_width": 40.0, "front_setback": 10.0, "side_setback": 5.0,  "rear_setback": 5.0,  "max_far": 2.5},
    {"min_road_width": 40.0, "max_road_width": 60.0, "front_setback": 12.0, "side_setback": 6.0,  "rear_setback": 6.0,  "max_far": 3.0},
    {"min_road_width": 60.0, "max_road_width": 80.0, "front_setback": 15.0, "side_setback": 8.0,  "rear_setback": 8.0,  "max_far": 3.5},
    {"min_road_width": 80.0, "max_road_width": 9999.0, "front_setback": 18.0, "side_setback": 10.0, "rear_setback": 10.0, "max_far": 4.0},
]

def get_zoning_rules(jurisdiction: str = "Hyderabad", road_width: float = 30.0) -> Dict[str, Any]:
    """Retrieve applicable zoning rules based on jurisdiction and road width."""
    base = dict(HYDERABAD_DEFAULT_RULES)
    
    # Match road rule
    rule = None
    for r in HYDERABAD_ROAD_RULES:
        if r["min_road_width"] <= road_width < r["max_road_width"]:
            rule = r
            break
            
    if not rule:
        rule = HYDERABAD_ROAD_RULES[2]  # Default to 30-40ft
        
    base.update({
        "front_setback": rule["front_setback"],
        "rear_setback": rule["rear_setback"],
        "side_setback_left": rule["side_setback"],
        "side_setback_right": rule["side_setback"],
        "max_far": rule["max_far"],
    })
    return base
