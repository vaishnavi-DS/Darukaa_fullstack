# Darukaa.Earth — Geospatial Carbon & Biodiversity Data Analytics Platform

[![CI/CD Pipeline](https://github.com/darukaa-earth/darukaa-earth/actions/workflows/ci.yml/badge.svg)](https://github.com/darukaa-earth/darukaa-earth/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg)](https://react.dev/)

**Darukaa.Earth** is an enterprise full-stack geospatial data analytics platform engineered for monitoring, visualizing, and reporting carbon sequestration and biodiversity restoration across global project sites.

---

##  Platform Overview & Core Features

### 1. User Authentication (JWT-Based)
- Secure registration and login flow powered by FastAPI, `python-jose`, and `bcrypt` password hashing.
- Role-based access control (Admin, Analyst, Viewer) protecting site polygon creation and project management endpoints.
- Quick 1-click Demo Admin login option (`admin@darukaa.earth` / `admin123`) for evaluation.

### 2. Project & Site Management
- Comprehensive dashboard to create carbon & biodiversity projects (Reforestation, Blue Carbon Mangroves, REDD+ Avoided Deforestation, Agroforestry).
- Interactive site directory with live search filtering, status indicators (`Healthy`, `Monitoring Needed`, `Degraded`), and summary KPI aggregations.

### 3. Interactive Geospatial Mapping & Polygon Drawing
- Built with high-performance vector rendering, supporting both Satellite Hybrid Imagery and Street maps.
- **Polygon Drawing Engine**: Admins can draw custom polygon site boundaries directly on the interactive map. Vertices are captured, and polygon area in hectares is computed live using spatial geometry algorithms.

### 4. Advanced Geospatial Data Analytics & Data Viz
- **Time-Series Charts**: Interactive multi-year analytics (2021–2026) powered by Chart.js / Highcharts:
  - Carbon Stock Trajectory (tCO₂e)
  - Satellite NDVI Vegetation Health Index (0.0 to 1.0)
  - Canopy Cover Percentage (%)
  - Biodiversity Score Index (0 to 100) & Species Richness Count
  - Soil Organic Carbon (g/kg)
- **GeoJSON Export**: Instant download of site boundary geometries and metadata in standard GeoJSON format.

### 5. Automated Code Quality & CI/CD
- **Pre-commit Hooks**: Husky & `lint-staged` with ESLint, Prettier, Black, and Flake8 for mandatory automated code formatting and linting prior to commits.
- **Automated Testing**: Pytest unit test suite verifying backend APIs, JWT security, and spatial calculations.
- **GitHub Actions**: Workflows (`.github/workflows/ci.yml`) automating build verification and test execution on push.

---

##  Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite, Tailwind CSS, Lucide Icons) |
| **Mapping Engine** | Mapbox GL JS & Leaflet with Satellite/Street tiles |
| **Data Visualization** | Chart.js & react-chartjs-2 |
| **Backend Framework** | Python 3.11+ with FastAPI & Uvicorn |
| **Geospatial Engine** | Shapely, PyProj, GeoJSON spatial calculation engine |
| **Database** | SQLAlchemy ORM (SQLite zero-config local / PostGIS PostgreSQL production) |
| **Authentication** | OAuth2 Bearer Tokens with JWT & Bcrypt |
| **CI/CD & DevOps** | GitHub Actions, Docker, Docker Compose, Pre-commit hooks |

---

##  Datasets & Mocks Rationale

The platform includes pre-seeded realistic geospatial datasets from key high-impact ecological reserves:
1. **Western Ghats Rainforest Canopy Restoration (WGC-2026)**
   - *Location*: Karnataka, India (`[75.085, 13.512]`)
   - *Rationale*: Tropical evergreen hotspot with endemic fauna and high biomass carbon density.
2. **Sundarbans Blue Carbon & Coastal Protection (SBC-2026)**
   - *Location*: West Bengal Delta (`[88.780, 22.110]`)
   - *Rationale*: Estuarine mangrove ecosystem offering high soil organic carbon accumulation and storm-surge protection.
3. **Amazon Basin Native Agroforestry Corridor (AMZ-2026)**
   - *Location*: Acre State, Brazil (`[-68.520, -9.850]`)
   - *Rationale*: High-density canopy corridor demonstrating community-led avoided deforestation (REDD+).

---

##  Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate

pip install -r requirements.txt
python -m pytest   # Run automated test suite
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build   # Production bundle test
npm run dev     # Starts Vite dev server on port 5173
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker & Containerized Deployment

To spin up the full platform with a dedicated **PostGIS PostgreSQL** container:

```bash
docker-compose up --build
```
- **Backend API**: `http://localhost:8000`
- **PostGIS Database**: `localhost:5432`

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
