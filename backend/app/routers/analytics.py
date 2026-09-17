from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Data Viz"])

@router.get("/site/{site_id}", response_model=List[schemas.SiteAnalyticsSchema])
def get_site_time_series_analytics(site_id: int, db: Session = Depends(get_db)):
    site = db.query(models.Site).filter(models.Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    analytics = db.query(models.SiteAnalytics).filter(
        models.SiteAnalytics.site_id == site_id
    ).order_by(models.SiteAnalytics.year.asc()).all()
    
    return analytics


@router.get("/overview", response_model=schemas.PlatformOverviewMetrics)
def get_platform_overview_metrics(db: Session = Depends(get_db)):
    total_projects = db.query(models.Project).count()
    total_sites = db.query(models.Site).count()
    
    sites = db.query(models.Site).all()
    total_area = sum(site.area_hectares for site in sites)
    
    total_carbon = 0.0
    biodiversity_scores = []
    ndvi_scores = []

    for site in sites:
        if site.analytics:
            latest = max(site.analytics, key=lambda a: a.year)
            total_carbon += latest.carbon_stock_tco2e
            biodiversity_scores.append(latest.biodiversity_score)
            ndvi_scores.append(latest.ndvi_index)
        else:
            total_carbon += site.area_hectares * site.carbon_density_per_ha

    avg_bio = sum(biodiversity_scores) / len(biodiversity_scores) if biodiversity_scores else 75.0
    avg_ndvi = sum(ndvi_scores) / len(ndvi_scores) if ndvi_scores else 0.68

    return {
        "total_projects": total_projects,
        "total_sites": total_sites,
        "total_area_hectares": round(total_area, 2),
        "total_carbon_sequestrated_tco2e": round(total_carbon, 2),
        "average_biodiversity_index": round(avg_bio, 1),
        "average_ndvi_index": round(avg_ndvi, 3)
    }
