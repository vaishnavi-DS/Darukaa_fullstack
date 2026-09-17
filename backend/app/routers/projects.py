import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[schemas.ProjectResponse])
def get_all_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    results = []
    
    for project in projects:
        total_area = sum(site.area_hectares for site in project.sites)
        
        # Calculate total carbon stock based on latest analytics for each site
        total_carbon = 0.0
        for site in project.sites:
            if site.analytics:
                latest = max(site.analytics, key=lambda a: a.year)
                total_carbon += latest.carbon_stock_tco2e
            else:
                total_carbon += site.area_hectares * site.carbon_density_per_ha

        # Process sites for response
        sites_response = []
        for site in project.sites:
            latest_analytics = max(site.analytics, key=lambda a: a.year) if site.analytics else None
            geom = json.loads(site.geometry_json) if isinstance(site.geometry_json, str) else site.geometry_json
            sites_response.append({
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

        results.append({
            "id": project.id,
            "name": project.name,
            "code": project.code,
            "category": project.category,
            "location": project.location,
            "description": project.description,
            "target_carbon_tco2e": project.target_carbon_tco2e,
            "status": project.status,
            "created_at": project.created_at,
            "sites": sites_response,
            "total_area_hectares": round(total_area, 2),
            "total_carbon_tco2e": round(total_carbon, 2)
        })

    return results


@router.post("", response_model=schemas.ProjectResponse)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = db.query(models.Project).filter(models.Project.code == project_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Project code '{project_in.code}' already exists.")

    project = models.Project(
        name=project_in.name,
        code=project_in.code,
        category=project_in.category,
        location=project_in.location,
        description=project_in.description,
        target_carbon_tco2e=project_in.target_carbon_tco2e or 10000.0,
        status=project_in.status or "Active",
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "code": project.code,
        "category": project.category,
        "location": project.location,
        "description": project.description,
        "target_carbon_tco2e": project.target_carbon_tco2e,
        "status": project.status,
        "created_at": project.created_at,
        "sites": [],
        "total_area_hectares": 0.0,
        "total_carbon_tco2e": 0.0
    }


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    total_area = sum(site.area_hectares for site in project.sites)
    total_carbon = 0.0
    sites_response = []
    
    for site in project.sites:
        latest_analytics = max(site.analytics, key=lambda a: a.year) if site.analytics else None
        if latest_analytics:
            total_carbon += latest_analytics.carbon_stock_tco2e
        else:
            total_carbon += site.area_hectares * site.carbon_density_per_ha

        geom = json.loads(site.geometry_json) if isinstance(site.geometry_json, str) else site.geometry_json
        sites_response.append({
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

    return {
        "id": project.id,
        "name": project.name,
        "code": project.code,
        "category": project.category,
        "location": project.location,
        "description": project.description,
        "target_carbon_tco2e": project.target_carbon_tco2e,
        "status": project.status,
        "created_at": project.created_at,
        "sites": sites_response,
        "total_area_hectares": round(total_area, 2),
        "total_carbon_tco2e": round(total_carbon, 2)
    }


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
