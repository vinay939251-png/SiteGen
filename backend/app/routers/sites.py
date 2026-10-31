from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import SiteModel
from backend.app.schemas import SiteCreate, SiteResponse

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(payload: SiteCreate, db: Session = Depends(get_db)):
    db_site = SiteModel(
        name=payload.name,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        boundary=payload.boundary,
        area_sqft=payload.area_sqft,
        area_sqm=payload.area_sqm,
        perimeter=payload.perimeter,
        width=payload.width,
        depth=payload.depth,
        road_width=payload.road_width,
        land_price_total=payload.land_price_total,
    )
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

@router.get("", response_model=List[SiteResponse])
def list_sites(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SiteModel).order_by(SiteModel.id.desc()).offset(skip).limit(limit).all()

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SiteModel).filter(SiteModel.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(SiteModel).filter(SiteModel.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return None
