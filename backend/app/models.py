from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    JSON,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class SiteModel(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, default="Unnamed Plot")
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    boundary = Column(JSON, nullable=False)  # GeoJSON or list of {x, y}
    area_sqft = Column(Float, nullable=False)
    area_sqm = Column(Float, nullable=False)
    perimeter = Column(Float, nullable=True)
    width = Column(Float, nullable=True)
    depth = Column(Float, nullable=True)
    road_width = Column(Float, nullable=False, default=30.0)
    land_price_total = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scenarios = relationship("ScenarioModel", back_populates="site", cascade="all, delete-orphan")


class ZoningRuleModel(Base):
    __tablename__ = "zoning_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    jurisdiction = Column(String(100), default="Hyderabad")
    rule_name = Column(String(200), nullable=False)
    road_width_min = Column(Float, nullable=False)
    road_width_max = Column(Float, nullable=True)
    front_setback = Column(Float, nullable=False)
    rear_setback = Column(Float, nullable=False)
    side_setback_left = Column(Float, nullable=False)
    side_setback_right = Column(Float, nullable=False)
    max_height = Column(Float, nullable=False)
    max_far = Column(Float, nullable=False)
    ground_coverage_max = Column(Float, nullable=False, default=0.60)
    parking_ratio = Column(Float, nullable=False, default=0.25)
    notes = Column(Text, nullable=True)


class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id = Column(String(100), primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    typology = Column(String(100), default="Apartment")
    floors = Column(Integer, default=8)
    floor_height = Column(Float, default=3.2)
    target_far = Column(Float, default=2.5)
    efficiency = Column(Float, default=0.80)
    land_cost = Column(Float, default=0.0)
    construction_cost_per_sqft = Column(Float, default=2200.0)
    selling_price_per_sqft = Column(Float, default=6500.0)
    additional_cost_percent = Column(Float, default=8.0)
    
    site_snapshot = Column(JSON, nullable=True)
    feasibility_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("SiteModel", back_populates="scenarios")

