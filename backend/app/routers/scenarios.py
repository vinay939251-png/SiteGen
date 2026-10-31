import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import ScenarioModel
from backend.app.schemas import ScenarioCreate, ScenarioResponse

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.post("", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(payload: ScenarioCreate, db: Session = Depends(get_db)):
    scen_id = payload.id or f"scen-{int(time.time() * 1000)}"
    db_scen = ScenarioModel(
        id=scen_id,
        site_id=payload.site_id,
        name=payload.name,
        typology=payload.typology,
        floors=payload.floors,
        floor_height=payload.floor_height,
        target_far=payload.target_far,
        efficiency=payload.efficiency,
        land_cost=payload.land_cost,
        construction_cost_per_sqft=payload.construction_cost_per_sqft,
        selling_price_per_sqft=payload.selling_price_per_sqft,
        additional_cost_percent=payload.additional_cost_percent,
        site_snapshot=payload.site_snapshot,
        feasibility_result=payload.feasibility_result,
    )
    db.merge(db_scen)
    db.commit()
    db.refresh(db_scen)
    return db_scen

@router.get("", response_model=List[ScenarioResponse])
def list_scenarios(db: Session = Depends(get_db)):
    return db.query(ScenarioModel).order_by(ScenarioModel.created_at.desc()).all()

@router.get("/{scen_id}", response_model=ScenarioResponse)
def get_scenario(scen_id: str, db: Session = Depends(get_db)):
    scen = db.query(ScenarioModel).filter(ScenarioModel.id == scen_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scen

@router.delete("/{scen_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(scen_id: str, db: Session = Depends(get_db)):
    scen = db.query(ScenarioModel).filter(ScenarioModel.id == scen_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail="Scenario not found")
    db.delete(scen)
    db.commit()
    return None
