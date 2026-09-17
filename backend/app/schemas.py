from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "admin"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime


# --- Analytics Schemas ---
class SiteAnalyticsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    site_id: int
    year: int
    carbon_stock_tco2e: float
    ndvi_index: float
    biodiversity_score: float
    canopy_cover_pct: float
    soil_organic_carbon_g_kg: float
    species_count: int
    recorded_at: datetime


# --- Site Schemas ---
class SiteCreate(BaseModel):
    project_id: int
    name: str
    site_code: Optional[str] = None
    geometry_json: Dict[str, Any]  # GeoJSON Geometry object (Polygon)
    status: Optional[str] = "Healthy"
    carbon_density_per_ha: Optional[float] = 140.0

class SiteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    name: str
    site_code: Optional[str] = None
    area_hectares: float
    geometry_json: Any
    status: str
    carbon_density_per_ha: float
    created_at: datetime
    latest_analytics: Optional[SiteAnalyticsSchema] = None


# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str
    code: str
    category: str
    location: str
    description: Optional[str] = None
    target_carbon_tco2e: Optional[float] = 10000.0
    status: Optional[str] = "Active"

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    category: str
    location: str
    description: Optional[str] = None
    target_carbon_tco2e: float
    status: str
    created_at: datetime
    sites: List[SiteResponse] = []
    total_area_hectares: Optional[float] = 0.0
    total_carbon_tco2e: Optional[float] = 0.0

# Metrics Overview Summary
class PlatformOverviewMetrics(BaseModel):
    total_projects: int
    total_sites: int
    total_area_hectares: float
    total_carbon_sequestrated_tco2e: float
    average_biodiversity_index: float
    average_ndvi_index: float
