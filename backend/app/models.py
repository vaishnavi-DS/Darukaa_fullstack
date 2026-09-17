from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="admin")  # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="creator")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    code = Column(String, unique=True, index=True)
    category = Column(String, nullable=False)  # Reforestation, Mangrove Restoration, Avoided Deforestation, Agroforestry
    location = Column(String, nullable=False)   # e.g., "Western Ghats, India"
    description = Column(Text, nullable=True)
    target_carbon_tco2e = Column(Float, default=10000.0)
    status = Column(String, default="Active")  # Active, Under Review, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    site_code = Column(String, index=True)
    area_hectares = Column(Float, nullable=False)
    geometry_json = Column(Text, nullable=False)  # GeoJSON Polygon string
    status = Column(String, default="Healthy")     # Healthy, Monitoring Needed, Degraded
    carbon_density_per_ha = Column(Float, default=145.5)  # tCO2e / ha
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sites")
    analytics = relationship("SiteAnalytics", back_populates="site", cascade="all, delete-orphan")


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    year = Column(Integer, nullable=False)
    carbon_stock_tco2e = Column(Float, nullable=False)
    ndvi_index = Column(Float, nullable=False)  # 0.0 - 1.0 Normalized Difference Vegetation Index
    biodiversity_score = Column(Float, nullable=False)  # 0 - 100 Index
    canopy_cover_pct = Column(Float, nullable=False)     # 0 - 100%
    soil_organic_carbon_g_kg = Column(Float, nullable=False) # g/kg
    species_count = Column(Integer, default=42)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="analytics")
