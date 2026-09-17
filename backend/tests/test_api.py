import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app import seed

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed.seed_initial_data(db)
    db.close()
    yield

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["platform"] == "Darukaa.Earth Geospatial Data Analytics"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@darukaa.earth", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@darukaa.earth"

def test_gmail_register_and_login():
    unique_email = f"user_{int(time.time())}@gmail.com"
    # 1. Register a new user with a gmail account
    reg_response = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "mypassword123", "full_name": "Dr. Jane Doe"}
    )
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email

    # 2. Login with registered gmail account
    login_response = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "mypassword123"}
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == unique_email

def test_get_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) >= 3

def test_get_overview_metrics():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    metrics = response.json()
    assert "total_projects" in metrics
    assert "total_carbon_sequestrated_tco2e" in metrics
    assert metrics["total_projects"] >= 3

def test_get_sites():
    response = client.get("/api/sites")
    assert response.status_code == 200
    sites = response.json()
    assert isinstance(sites, list)
    assert len(sites) >= 1
    assert "geometry_json" in sites[0]

def test_site_analytics():
    response = client.get("/api/analytics/site/1")
    assert response.status_code == 200
    analytics = response.json()
    assert isinstance(analytics, list)
    assert len(analytics) >= 5
    assert "carbon_stock_tco2e" in analytics[0]
