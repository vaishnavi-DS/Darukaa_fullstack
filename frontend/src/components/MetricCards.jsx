import React from 'react';
import { Leaf, Layers, Maximize2, Activity, Award } from 'lucide-react';

export default function MetricCards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      label: 'Total Carbon Sequestrated',
      value: `${metrics.total_carbon_sequestrated_tco2e?.toLocaleString() || '0'} tCO₂e`,
      subtext: 'Across all active restoration sites',
      icon: Leaf,
      iconBg: 'bg-emerald-100 text-emerald-700',
      badge: '+12.4% YoY',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Monitored Geospatial Area',
      value: `${metrics.total_area_hectares?.toLocaleString() || '0'} Hectares`,
      subtext: `${metrics.total_sites || 0} Registered polygons`,
      icon: Maximize2,
      iconBg: 'bg-blue-100 text-blue-700',
      badge: 'GPS / GIS Verified',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Average Biodiversity Score',
      value: `${metrics.average_biodiversity_index || '0.0'} / 100`,
      subtext: 'Flora & fauna index',
      icon: Award,
      iconBg: 'bg-teal-100 text-teal-700',
      badge: 'Healthy Tier',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      label: 'Mean Satellite NDVI Index',
      value: `${metrics.average_ndvi_index || '0.00'}`,
      subtext: 'Vegetation canopy density (0-1)',
      icon: Activity,
      iconBg: 'bg-amber-100 text-amber-700',
      badge: 'High Canopy Cover',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${card.badgeBg}`}>
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{card.value}</h3>
              <p className="text-xs text-slate-500 mt-1.5">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
