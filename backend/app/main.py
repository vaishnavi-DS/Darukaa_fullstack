from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import auth, projects, sites, analytics
from app import seed

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Darukaa.Earth Geospatial Data Analytics Platform API",
    description="Full-Stack Carbon and Biodiversity Project Dashboard & Analytics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(sites.router)
app.include_router(analytics.router)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed.seed_initial_data(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "platform": "Darukaa.Earth Geospatial Data Analytics",
        "docs_url": "/docs"
    }
