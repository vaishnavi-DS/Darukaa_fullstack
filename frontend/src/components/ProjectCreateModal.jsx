import React, { useState } from 'react';
import { X, Plus, FolderPlus, MapPin, Target } from 'lucide-react';
import api from '../api';

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Reforestation & Biodiversity Corridor',
    location: '',
    description: '',
    target_carbon_tco2e: 25000.0,
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    api.post('/projects', formData)
      .then(res => {
        setLoading(false);
        onProjectCreated(res.data);
        onClose();
      })
      .catch(err => {
        setLoading(false);
        setError(err.response?.data?.detail || 'Failed to create project');
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
              <p className="text-xs text-slate-500">Register a new carbon & biodiversity initiative</p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Western Ghats Evergreen Corridor"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WGC-2026"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Reforestation & Biodiversity Corridor">Reforestation Corridor</option>
                <option value="Mangrove Restoration">Mangrove Restoration (Blue Carbon)</option>
                <option value="Avoided Deforestation">Avoided Deforestation (REDD+)</option>
                <option value="Agroforestry">Agroforestry & Soil Carbon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location & Region</label>
            <input
              type="text"
              required
              placeholder="e.g. Western Ghats, Karnataka, India"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Carbon Sequestration (tCO₂e)</label>
            <input
              type="number"
              required
              step="500"
              value={formData.target_carbon_tco2e}
              onChange={e => setFormData({ ...formData, target_carbon_tco2e: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Describe restoration goals, community involvement, and biodiversity objectives..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
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
              {loading ? 'Creating...' : 'Register Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
