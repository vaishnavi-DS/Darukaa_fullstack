import React, { useState } from 'react';
import { Search, Folder, MapPin, ChevronRight, Eye, Trash2, Plus, ZoomIn, Filter } from 'lucide-react';
import api from '../api';

export default function ProjectListDrawer({
  projects,
  onSelectSite,
  onOpenCreateProject,
  onRefresh,
  selectedProject,
  onVisitProject,
  onClearProjectFilter
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = (projects || []).filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(search.toLowerCase()) ||
                          proj.location.toLowerCase().includes(search.toLowerCase()) ||
                          proj.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProject = (e, projectId, projectName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${projectName}" and all associated site geometries?`)) return;
    
    api.delete(`/projects/${projectId}`)
      .then(() => {
        onRefresh();
        if (selectedProject && selectedProject.id === projectId) {
          onClearProjectFilter();
        }
      })
      .catch(err => {
        alert(err.response?.data?.detail || 'Failed to delete project');
      });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
      
      {/* Header & Search */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Projects Directory</h3>
          </div>
          <div className="flex items-center space-x-2">
            {selectedProject && (
              <button
                onClick={onClearProjectFilter}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Reset Filter
              </button>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
              {filteredProjects.length} Projects
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name, code or region..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <p className="text-xs">No matching projects found.</p>
            <button
              onClick={onOpenCreateProject}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              + Create First Project
            </button>
          </div>
        ) : (
          filteredProjects.map(project => {
            const isVisited = selectedProject && selectedProject.id === project.id;

            return (
              <div
                key={project.id}
                className={`bg-white rounded-lg border transition-all p-3.5 space-y-3 ${
                  isVisited ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {project.code}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {project.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{project.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {project.location}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-slate-100"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-md text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Area</span>
                    <p className="font-bold text-slate-800">{project.total_area_hectares || 0} Ha</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Est. Carbon</span>
                    <p className="font-bold text-emerald-700">{project.total_carbon_tco2e?.toLocaleString() || 0} tCO₂e</p>
                  </div>
                </div>

                {/* Action Controls: Visit Project & Delete Option */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onVisitProject(project)}
                    className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Visit Project & Map</span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                    className="py-1.5 px-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-md transition-colors flex items-center"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Nested Sites Quick List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Geographical Sites ({project.sites ? project.sites.length : 0})
                  </span>
                  
                  {project.sites && project.sites.length > 0 ? (
                    project.sites.map(site => (
                      <div
                        key={site.id}
                        onClick={() => onSelectSite(site)}
                        className="flex items-center justify-between p-2 rounded-md border border-slate-100 bg-white hover:bg-emerald-50/50 hover:border-emerald-200 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            site.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">{site.name}</p>
                            <p className="text-[10px] text-slate-500">{site.area_hectares} Ha &bull; {site.carbon_density_per_ha} tCO₂e/Ha</p>
                          </div>
                        </div>

                        <div className="flex items-center text-xs text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No polygons added to this project yet.</p>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
