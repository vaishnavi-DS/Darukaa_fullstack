import React from 'react';
import { X, Trash2, MapPin, Plus, Folder, Target, Layers, ChevronRight, ExternalLink } from 'lucide-react';
import api from '../api';

export default function ProjectDetailModal({ project, isOpen, onClose, onSelectSite, onOpenCreateSite, onRefresh }) {
  if (!isOpen || !project) return null;

  const handleDeleteProject = () => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}" and all associated site geometries?`)) return;

    api.delete(`/projects/${project.id}`)
      .then(() => {
        onRefresh();
        onClose();
      })
      .catch(err => {
        alert(err.response?.data?.detail || 'Failed to delete project');
      });
  };

  const handleDeleteSite = (e, siteId, siteName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete site "${siteName}"?`)) return;

    api.delete(`/sites/${siteId}`)
      .then(() => {
        onRefresh();
      })
      .catch(err => {
        alert(err.response?.data?.detail || 'Failed to delete site');
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700 uppercase">
                  {project.code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {project.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{project.name}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Location / Region</span>
              <p className="text-xs font-bold text-slate-800 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {project.location}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Monitored Area</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{project.total_area_hectares || 0} Hectares</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Est. Carbon Stock</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {project.total_carbon_tco2e?.toLocaleString() || 0} tCO₂e
              </p>
            </div>
          </div>

          {/* Project Description */}
          {project.description && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Project Description & Objectives</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Sites Header & List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Geographical Site Polygons ({project.sites ? project.sites.length : 0})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateSite();
                }}
                className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Draw New Site Polygon
              </button>
            </div>

            {project.sites && project.sites.length > 0 ? (
              <div className="space-y-2">
                {project.sites.map(site => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-3 h-3 rounded-full ${
                        site.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">{site.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                            {site.site_code || 'SITE'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {site.area_hectares} Ha &bull; {site.carbon_density_per_ha} tCO₂e/Ha
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectSite(site);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center"
                      >
                        Inspect Analytics <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSite(e, site.id, site.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                        title="Delete Site Polygon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs">
                No site polygons drawn for this project yet. Use "Draw New Site Polygon" to add one!
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            Delete Entire Project
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
