import React from 'react';
import { Globe, Plus, Layers, User, LogOut, ShieldCheck, MapPin } from 'lucide-react';

export default function Header({ user, onOpenAuth, onLogout, onOpenCreateProject, onOpenCreateSite }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Platform Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Darukaa<span className="text-emerald-600">.Earth</span>
              </span>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Geospatial Carbon & Biodiversity Analytics Platform
              </p>
            </div>
          </div>

          {/* Action Buttons & Quick Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button
                  onClick={onOpenCreateSite}
                  className="inline-flex items-center px-3 py-2 border border-emerald-600 text-xs font-semibold rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  Draw Site Polygon
                </button>

                <button
                  onClick={onOpenCreateProject}
                  className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-semibold rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Project
                </button>

                {/* User Dropdown Badge */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{user.full_name.split(' ')[0]}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 uppercase font-bold px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-xs font-semibold rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                <User className="w-4 h-4 mr-1.5 text-slate-500" />
                Admin Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
