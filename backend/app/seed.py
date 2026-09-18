import json
from sqlalchemy.orm import Session
from app import models, auth, analytics_engine


def seed_initial_data(db: Session):
    print("Checking Darukaa.Earth initial data...")

    # ---------------------------------------------------------
    # 1. Get or create the admin user
    # ---------------------------------------------------------
    admin_user = (
        db.query(models.User)
        .filter(models.User.email == "admin@darukaa.earth")
        .first()
    )

    if not admin_user:
        print("Creating admin user...")

        admin_user = models.User(
            email="admin@darukaa.earth",
            hashed_password=auth.get_password_hash("admin123"),
            full_name="Dr. Elena Vance (Lead Sustainability Admin)",
            role="admin"
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    # ---------------------------------------------------------
    # 2. Initial projects
    # ---------------------------------------------------------
    projects_data = [
        {
            "name": "Western Ghats Rainforest Canopy Restoration",
            "code": "WGC-2026",
            "category": "Reforestation & Biodiversity Corridor",
            "location": "Western Ghats, Karnataka, India",
            "description": "Targeted tropical evergreen rainforest restoration aiming to reconnect fragmented elephant corridors, boost native endemic flora diversity, and store atmospheric carbon.",
            "target_carbon_tco2e": 45000.0,
            "status": "Active",
            "sites": [
                {
                    "name": "Agumbe Rainforest Buffer Zone",
                    "site_code": "SITE-WGC-001",
                    "carbon_density_per_ha": 165.4,
                    "status": "Healthy",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [75.085, 13.512],
                            [75.115, 13.518],
                            [75.122, 13.485],
                            [75.092, 13.479],
                            [75.085, 13.512]
                        ]]
                    }
                },
                {
                    "name": "Kudremukh Ridge Extension",
                    "site_code": "SITE-WGC-002",
                    "carbon_density_per_ha": 142.0,
                    "status": "Healthy",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [75.210, 13.230],
                            [75.240, 13.245],
                            [75.248, 13.210],
                            [75.215, 13.205],
                            [75.210, 13.230]
                        ]]
                    }
                }
            ]
        },
        {
            "name": "Sundarbans Blue Carbon & Coastal Protection",
            "code": "SBC-2026",
            "category": "Mangrove Restoration",
            "location": "Sundarbans Delta, West Bengal, India",
            "description": "Coastal blue carbon sequestration project using Rhizophora mangle and Avicennia marina to protect shoreline communities while building rich estuarine biodiversity.",
            "target_carbon_tco2e": 78000.0,
            "status": "Active",
            "sites": [
                {
                    "name": "Sajnekhali Estuary Mangrove Sector",
                    "site_code": "SITE-SBC-001",
                    "carbon_density_per_ha": 210.8,
                    "status": "Healthy",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [88.780, 22.110],
                            [88.820, 22.115],
                            [88.825, 22.085],
                            [88.785, 22.080],
                            [88.780, 22.110]
                        ]]
                    }
                }
            ]
        },
        {
            "name": "Amazon Basin Native Agroforestry Corridor",
            "code": "AMZ-2026",
            "category": "Agroforestry & Avoided Deforestation",
            "location": "Acre State, Amazon Basin, Brazil",
            "description": "Community-led agroforestry project integrating high-density carbon canopy with sustainable indigenous harvesting practices.",
            "target_carbon_tco2e": 120000.0,
            "status": "Active",
            "sites": [
                {
                    "name": "Chico Mendes Extractive Reserve Site A",
                    "site_code": "SITE-AMZ-001",
                    "carbon_density_per_ha": 185.0,
                    "status": "Monitoring Needed",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-68.520, -9.850],
                            [-68.480, -9.840],
                            [-68.470, -9.880],
                            [-68.515, -9.890],
                            [-68.520, -9.850]
                        ]]
                    }
                }
            ]
        }
    ]

    # ---------------------------------------------------------
    # 3. Add only projects that don't already exist
    # ---------------------------------------------------------
    for proj_item in projects_data:

        existing_project = (
            db.query(models.Project)
            .filter(models.Project.code == proj_item["code"])
            .first()
        )

        if existing_project:
            print(
                f"Project already exists: "
                f"{proj_item['name']} ({proj_item['code']})"
            )
            continue

        print(
            f"Adding project: "
            f"{proj_item['name']} ({proj_item['code']})"
        )

        project = models.Project(
            name=proj_item["name"],
            code=proj_item["code"],
            category=proj_item["category"],
            location=proj_item["location"],
            description=proj_item["description"],
            target_carbon_tco2e=proj_item["target_carbon_tco2e"],
            status=proj_item["status"],
            created_by_id=admin_user.id
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        # -----------------------------------------------------
        # 4. Add project sites
        # -----------------------------------------------------
        for site_item in proj_item["sites"]:

            existing_site = (
                db.query(models.Site)
                .filter(
                    models.Site.site_code == site_item["site_code"]
                )
                .first()
            )

            if existing_site:
                print(
                    f"Site already exists: "
                    f"{site_item['name']}"
                )
                continue

            area_ha = analytics_engine.calculate_polygon_area_hectares(
                site_item["geometry"]
            )

            site = models.Site(
                project_id=project.id,
                name=site_item["name"],
                site_code=site_item["site_code"],
                area_hectares=area_ha,
                geometry_json=json.dumps(site_item["geometry"]),
                status=site_item["status"],
                carbon_density_per_ha=site_item["carbon_density_per_ha"]
            )

            db.add(site)
            db.commit()
            db.refresh(site)

            # -------------------------------------------------
            # 5. Generate historical analytics
            # -------------------------------------------------
            analytics_entries = (
                analytics_engine.generate_historical_analytics(
                    site_id=site.id,
                    area_ha=area_ha,
                    carbon_density=site.carbon_density_per_ha
                )
            )

            for entry in analytics_entries:
                db.add(models.SiteAnalytics(**entry))

            db.commit()

    # ---------------------------------------------------------
    # 6. Final count
    # ---------------------------------------------------------
    project_count = db.query(models.Project).count()

    print(
        f"Seed process completed. "
        f"Total projects in database: {project_count}"
    )