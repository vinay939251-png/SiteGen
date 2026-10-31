"""
Feasibility & Financial Calculation Engine.
"""
import math
from typing import Dict, Any, List
from backend.app.engine.zoning import get_zoning_rules

def calculate_feasibility(
    plot_width: float,
    plot_depth: float,
    plot_area_sqft: float,
    road_width: float,
    typology: str = "Apartment",
    floors: int = 8,
    floor_height: float = 3.2,
    target_far: float = 2.5,
    efficiency: float = 0.80,
    land_cost: float = 20000000.0,
    construction_cost_per_sqft: float = 2200.0,
    selling_price_per_sqft: float = 6500.0,
    additional_cost_percent: float = 8.0,
    parking_cost_per_space: float = 200000.0,
) -> Dict[str, Any]:
    # 1. Fetch zoning rules
    zoning = get_zoning_rules("Hyderabad", road_width)
    
    front_setback = zoning["front_setback"]
    rear_setback = zoning["rear_setback"]
    side_l = zoning["side_setback_left"]
    side_r = zoning["side_setback_right"]
    max_permissible_far = zoning["max_far"]
    max_height = zoning["max_height"]
    parking_ratio = zoning["parking_ratio"]
    
    # 2. Buildable Footprint
    buildable_w = max(0.0, plot_width - side_l - side_r)
    buildable_d = max(0.0, plot_depth - front_setback - rear_setback)
    buildable_footprint_sqft = buildable_w * buildable_d
    
    ground_coverage_percent = (
        (buildable_footprint_sqft / plot_area_sqft * 100.0) if plot_area_sqft > 0 else 0.0
    )
    
    # 3. GFA and Height
    effective_far = min(target_far, max_permissible_far)
    max_gfa_from_far = plot_area_sqft * effective_far
    gfa_from_floors = buildable_footprint_sqft * floors
    gross_floor_area = min(max_gfa_from_far, gfa_from_floors)
    
    achieved_far = (gross_floor_area / plot_area_sqft) if plot_area_sqft > 0 else 0.0
    saleable_area = gross_floor_area * efficiency
    building_height_m = floors * floor_height
    
    # 4. Parking
    parking_spaces = math.ceil(saleable_area / parking_ratio) if parking_ratio > 0 else 0
    
    # 5. Financials
    total_construction_cost = gross_floor_area * construction_cost_per_sqft
    parking_total_cost = parking_spaces * parking_cost_per_space
    base_cost = land_cost + total_construction_cost + parking_total_cost
    additional_cost = base_cost * (additional_cost_percent / 100.0)
    total_cost = base_cost + additional_cost
    
    estimated_revenue = saleable_area * selling_price_per_sqft
    estimated_profit = estimated_revenue - total_cost
    margin_percent = (estimated_profit / estimated_revenue * 100.0) if estimated_revenue > 0 else 0.0
    roi_percent = (estimated_profit / total_cost * 100.0) if total_cost > 0 else 0.0
    
    # 6. Indicators
    indicators: List[Dict[str, str]] = []
    
    # Height Check
    if building_height_m <= max_height:
        indicators.append({
            "name": "Statutory Height Compliance",
            "status": "PASS",
            "message": f"Building height {building_height_m:.1f}m is within permissible limit of {max_height:.1f}m",
            "value": f"{building_height_m:.1f}m / {max_height:.1f}m",
        })
    else:
        indicators.append({
            "name": "Statutory Height Compliance",
            "status": "FAIL",
            "message": f"Building height {building_height_m:.1f}m exceeds maximum permissible {max_height:.1f}m for road width {road_width}ft",
            "value": f"{building_height_m:.1f}m > {max_height:.1f}m",
        })
        
    # Margin Check
    if margin_percent >= 25.0:
        indicators.append({
            "name": "Financial Profit Margin",
            "status": "PASS",
            "message": f"Healthy profit margin of {margin_percent:.1f}% indicates strong acquisition viability",
            "value": f"{margin_percent:.1f}%",
        })
    elif margin_percent >= 12.0:
        indicators.append({
            "name": "Financial Profit Margin",
            "status": "WARN",
            "message": f"Moderate profit margin of {margin_percent:.1f}%; sensitive to construction cost escalation",
            "value": f"{margin_percent:.1f}%",
        })
    else:
        indicators.append({
            "name": "Financial Profit Margin",
            "status": "FAIL",
            "message": f"Thin margin of {margin_percent:.1f}%; land acquisition carries high risk",
            "value": f"{margin_percent:.1f}%",
        })
        
    # Ground Coverage Check
    if ground_coverage_percent <= 65.0:
        indicators.append({
            "name": "Ground Coverage Ratio",
            "status": "PASS",
            "message": f"Footprint coverage of {ground_coverage_percent:.1f}% leaves adequate open space",
            "value": f"{ground_coverage_percent:.1f}%",
        })
    else:
        indicators.append({
            "name": "Ground Coverage Ratio",
            "status": "WARN",
            "message": f"High ground coverage of {ground_coverage_percent:.1f}% may require additional setback variances",
            "value": f"{ground_coverage_percent:.1f}%",
        })

    return {
        "plot_area_sqft": round(plot_area_sqft, 2),
        "plot_area_sqm": round(plot_area_sqft * 0.092903, 2),
        "buildable_footprint_sqft": round(buildable_footprint_sqft, 2),
        "buildable_footprint_sqm": round(buildable_footprint_sqft * 0.092903, 2),
        "ground_coverage_percent": round(ground_coverage_percent, 2),
        "gross_floor_area_sqft": round(gross_floor_area, 2),
        "saleable_area_sqft": round(saleable_area, 2),
        "floors": floors,
        "building_height_m": round(building_height_m, 2),
        "max_permissible_height_m": max_height,
        "achieved_far": round(achieved_far, 2),
        "max_permissible_far": max_permissible_far,
        "parking_spaces": parking_spaces,
        "setbacks": {
            "front": front_setback,
            "rear": rear_setback,
            "sideLeft": side_l,
            "sideRight": side_r,
        },
        "costs": {
            "land_cost": round(land_cost, 2),
            "construction_cost": round(total_construction_cost, 2),
            "parking_cost": round(parking_total_cost, 2),
            "additional_cost": round(additional_cost, 2),
            "total_development_cost": round(total_cost, 2),
        },
        "estimated_revenue": round(estimated_revenue, 2),
        "estimated_profit": round(estimated_profit, 2),
        "margin_percent": round(margin_percent, 2),
        "roi_percent": round(roi_percent, 2),
        "indicators": indicators,
    }
