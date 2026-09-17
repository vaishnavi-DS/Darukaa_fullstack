import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth, analytics_engine

router = APIRouter(prefix="/api/sites", tags=["Geospatial Sites"])

@router.get("", response_model=List[schemas.SiteResponse])
def get_all_sites(db: Session = Depends(get_db)):
    sites = db.query(models.Site).all()
    results = []
    for site in sites:
        latest_analytics = max(site.analytics, key=lambda a: a.year) if site.analytics else None
        geom = json.loads(site.geometry_json) if isinstance(site.geometry_json, str) else site.geometry_json
        results.append({
            "id": site.id,
            "project_id": site.project_id,
            "name": site.name,
            "site_code": site.site_code,
            "area_hectares": site.area_hectares,
            "geometry_json": geom,
            "status": site.status,
            "carbon_density_per_ha": site.carbon_density_per_ha,
            "created_at": site.created_at,
            "latest_analytics": latest_analytics
        })
    return results

@router.post("", response_model=schemas.SiteResponse)
def create_site(
    site_in: schemas.SiteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == site_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Parent project not found")

    # Calculate actual polygon area using spatial calculation
    geom_json_str = json.dumps(site_in.geometry_json)
    calculated_area_ha = analytics_engine.calculate_polygon_area_hectares(site_in.geometry_json)

    site_code = site_in.site_code or f"SITE-{project.code}-{db.query(models.Site).count() + 1:03d}"

    site = models.Site(
        project_id=site_in.project_id,
        name=site_in.name,
        site_code=site_code,
        area_hectares=calculated_area_ha,
        geometry_json=geom_json_str,
        status=site_in.status or "Healthy",
        carbon_density_per_ha=site_in.carbon_density_per_ha or 145.0
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    # Automatically generate 6-year analytics series for the newly created polygon site
    analytics_series = analytics_engine.generate_historical_analytics(
        site_id=site.id,
        area_ha=calculated_area_ha,
        carbon_density=site.carbon_density_per_ha
    )
    for entry in analytics_series:
        db_analytics = models.SiteAnalytics(**entry)
        db.add(db_analytics)
    
    db.commit()
    db.refresh(site)

    latest_analytics = max(site.analytics, key=lambda a: a.year) if site.analytics else None

    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "site_code": site.site_code,
        "area_hectares": site.area_hectares,
        "geometry_json": site_in.geometry_json,
        "status": site.status,
        "carbon_density_per_ha": site.carbon_density_per_ha,
        "created_at": site.created_at,
        "latest_analytics": latest_analytics
    }

@router.get("/{site_id}", response_model=schemas.SiteResponse)
def get_site_by_id(site_id: int, db: Session = Depends(get_db)):
    site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    latest_analytics = max(site.analytics, key=lambda a: a.year) if site.analytics else None
    geom = json.loads(site.geometry_json) if isinstance(site.geometry_json, str) else site.geometry_json

    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "site_code": site.site_code,
        "area_hectares": site.area_hectares,
        "geometry_json": geom,
        "status": site.status,
        "carbon_density_per_ha": site.carbon_density_per_ha,
        "created_at": site.created_at,
        "latest_analytics": latest_analytics
    }

@router.delete("/{site_id}")
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return {"message": "Site deleted successfully"}
