import React, { useState } from 'react';
import { X, MapPin, Layers, CheckCircle } from 'lucide-react';
import api from '../api';

export default function SiteCreateModal({ isOpen, onClose, drawnPolygon, projects, onSiteCreated }) {
  const [formData, setFormData] = useState({
    project_id: projects && projects.length > 0 ? projects[0].id : 1,
    name: '',
    site_code: '',
    status: 'Healthy',
    carbon_density_per_ha: 155.0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !drawnPolygon) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      project_id: parseInt(formData.project_id),
      name: formData.name,
      site_code: formData.site_code || undefined,
      geometry_json: drawnPolygon,
      status: formData.status,
      carbon_density_per_ha: parseFloat(formData.carbon_density_per_ha)
    };

    api.post('/sites', payload)
      .then(res => {
        setLoading(false);
        onSiteCreated(res.data);
        onClose();
      })
      .catch(err => {
        setLoading(false);
        setError(err.response?.data?.detail || 'Failed to save site polygon');
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Save Drawn Site Polygon</h3>
              <p className="text-xs text-slate-500">Assign polygon to a project and compute analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <p className="font-semibold">GeoJSON Boundary captured!</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Coordinates: {drawnPolygon.coordinates[0]?.length || 0} vertices. Automatic spatial area & time-series analytics will be generated upon submit.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign to Project</label>
            <select
              value={formData.project_id}
              onChange={e => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Site Polygon Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Agumbe Buffer Sector 4"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Site Code (Optional)</label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={formData.site_code}
                onChange={e => setFormData({ ...formData, site_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Health Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Healthy">Healthy (High Density)</option>
                <option value="Monitoring Needed">Monitoring Needed</option>
                <option value="Degraded">Degraded (Restoration Target)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estimated Carbon Density (tCO₂e / Ha)</label>
            <input
              type="number"
              step="5"
              required
              value={formData.carbon_density_per_ha}
              onChange={e => setFormData({ ...formData, carbon_density_per_ha: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md transition-colors shadow-xs"
            >
              {loading ? 'Saving Polygon...' : 'Save Site & Calculate Analytics'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
