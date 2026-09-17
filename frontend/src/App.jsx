import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GeospatialMap from './components/GeospatialMap';
import ProjectListDrawer from './components/ProjectListDrawer';
import SiteAnalyticsModal from './components/SiteAnalyticsModal';
import ProjectCreateModal from './components/ProjectCreateModal';
import SiteCreateModal from './components/SiteCreateModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import AuthModal from './components/AuthModal';
import api from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  
  // Selected state
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // Filtered/Visited project
  const [visitingProjectModal, setVisitingProjectModal] = useState(null); // Detailed modal

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);

  // Check stored auth session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  // Fetch projects, sites & platform metrics overview
  const fetchData = () => {
    api.get('/analytics/overview')
      .then(res => setMetrics(res.data))
      .catch(err => console.error('Error fetching overview metrics:', err));

    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        if (selectedProject) {
          const updated = res.data.find(p => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      })
      .catch(err => console.error('Error fetching projects:', err));

    api.get('/sites')
      .then(res => setSites(res.data))
      .catch(err => console.error('Error fetching sites:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handlePolygonDrawn = (polygonGeoJson) => {
    setDrawnPolygon(polygonGeoJson);
    setIsCreateSiteOpen(true);
  };

  const handleSiteCreated = (newSite) => {
    fetchData();
    setSelectedSite(newSite);
  };

  const handleVisitProject = (project) => {
    setSelectedProject(project);
    setVisitingProjectModal(project);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenCreateProject={() => {
          if (!user) setIsAuthOpen(true);
          else setIsCreateProjectOpen(true);
        }}
        onOpenCreateSite={() => {
          if (!user) setIsAuthOpen(true);
          else setIsDrawingMode(!isDrawingMode);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Metric Cards Summary Header */}
        <MetricCards metrics={metrics} />

        {/* Core Layout: Geospatial Map + Project Directory Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Interactive Map (8 cols on large screen) */}
          <div className="lg:col-span-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Geospatial Site Polygon Viewer
              </h2>
              <span className="text-xs text-slate-500">
                Click any polygon or use "Draw Site" to register new boundaries
              </span>
            </div>
            
            <GeospatialMap
              sites={sites}
              onSelectSite={setSelectedSite}
              onPolygonDrawn={handlePolygonDrawn}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              selectedProject={selectedProject}
            />
          </div>

          {/* Projects & Sites Directory (4 cols on large screen) */}
          <div className="lg:col-span-4">
            <ProjectListDrawer
              projects={projects}
              onSelectSite={setSelectedSite}
              onOpenCreateProject={() => {
                if (!user) setIsAuthOpen(true);
                else setIsCreateProjectOpen(true);
              }}
              onRefresh={fetchData}
              selectedProject={selectedProject}
              onVisitProject={handleVisitProject}
              onClearProjectFilter={() => setSelectedProject(null)}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>&copy; 2026 Darukaa.Earth Platform. Full-Stack Geospatial Hackathon Submission.</p>
          <div className="flex items-center space-x-4">
            <span>FastAPI + PostgreSQL/PostGIS Engine</span>
            <span>React + Mapbox GL/Leaflet</span>
            <span>JWT Security</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SiteAnalyticsModal
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
      />

      <ProjectDetailModal
        project={visitingProjectModal}
        isOpen={!!visitingProjectModal}
        onClose={() => setVisitingProjectModal(null)}
        onSelectSite={setSelectedSite}
        onOpenCreateSite={() => {
          if (!user) setIsAuthOpen(true);
          else setIsDrawingMode(true);
        }}
        onRefresh={fetchData}
      />

      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={fetchData}
      />

      <SiteCreateModal
        isOpen={isCreateSiteOpen}
        onClose={() => {
          setIsCreateSiteOpen(false);
          setDrawnPolygon(null);
        }}
        drawnPolygon={drawnPolygon}
        projects={projects}
        onSiteCreated={handleSiteCreated}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          fetchData();
        }}
      />

    </div>
  );
}
