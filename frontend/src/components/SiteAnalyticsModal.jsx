import React, { useState, useEffect } from 'react';
import { X, Download, TrendingUp, Activity, Leaf, Shield, Calendar, Layers, MapPin } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export default function SiteAnalyticsModal({ site, onClose }) {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!site) return;

    setLoading(true);
    api.get(`/analytics/site/${site.id}`)
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load site analytics:', err);
        setLoading(false);
      });
  }, [site]);

  if (!site) return null;

  const years = analytics.map(a => a.year);
  const carbonValues = analytics.map(a => a.carbon_stock_tco2e);
  const ndviValues = analytics.map(a => a.ndvi_index);
  const biodiversityValues = analytics.map(a => a.biodiversity_score);
  const canopyValues = analytics.map(a => a.canopy_cover_pct);
  const soilCarbonValues = analytics.map(a => a.soil_organic_carbon_g_kg);

  // Carbon Sequestration Line Chart Options & Data
  const carbonChartData = {
    labels: years,
    datasets: [
      {
        label: 'Carbon Stock (tCO₂e)',
        data: carbonValues,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#059669',
        pointRadius: 4,
      }
    ]
  };

  // NDVI Vegetation & Canopy Chart
  const ndviChartData = {
    labels: years,
    datasets: [
      {
        label: 'NDVI Vegetation Index (0-1)',
        data: ndviValues,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        borderWidth: 2,
        yAxisID: 'yNDVI',
      },
      {
        label: 'Canopy Cover (%)',
        data: canopyValues,
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        borderWidth: 2,
        yAxisID: 'yCanopy',
      }
    ]
  };

  // Soil & Biodiversity Bar Chart
  const biodiversityChartData = {
    labels: years,
    datasets: [
      {
        label: 'Biodiversity Health Index',
        data: biodiversityValues,
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Soil Organic Carbon (g/kg)',
        data: soilCarbonValues,
        backgroundColor: '#d97706',
        borderRadius: 4,
      }
    ]
  };

  const downloadGeoJSON = () => {
    let geom = site.geometry_json;
    if (typeof geom === 'string') {
      try { geom = JSON.parse(geom); } catch (e) {}
    }

    const feature = {
      type: "Feature",
      properties: {
        id: site.id,
        name: site.name,
        code: site.site_code,
        area_hectares: site.area_hectares,
        carbon_density_per_ha: site.carbon_density_per_ha,
        status: site.status,
        exported_from: "Darukaa.Earth Platform"
      },
      geometry: geom
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(feature, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${site.site_code || 'site'}_geojson.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{site.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700">
                  {site.site_code || 'SITE'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  site.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {site.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Site Area: <strong className="text-slate-700">{site.area_hectares} Ha</strong> &bull; Carbon Density: <strong className="text-slate-700">{site.carbon_density_per_ha} tCO₂e/Ha</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadGeoJSON}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Export GeoJSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
              <p className="text-xs text-slate-500">Fetching geospatial analytics time-series...</p>
            </div>
          ) : (
            <>
              {/* Analytics Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">2026 Carbon Stock</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">
                    {carbonValues[carbonValues.length - 1]?.toLocaleString() || site.area_hectares * site.carbon_density_per_ha} tCO₂e
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Latest NDVI Score</span>
                  <p className="text-xl font-bold text-sky-700 mt-0.5">
                    {ndviValues[ndviValues.length - 1] || '0.72'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Biodiversity Health</span>
                  <p className="text-xl font-bold text-teal-700 mt-0.5">
                    {biodiversityValues[biodiversityValues.length - 1] || '84'}/100
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Soil Organic Carbon</span>
                  <p className="text-xl font-bold text-amber-700 mt-0.5">
                    {soilCarbonValues[soilCarbonValues.length - 1] || '24.5'} g/kg
                  </p>
                </div>
              </div>

              {/* Chart 1: Carbon Sequestration Growth */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Carbon Sequestration Trajectory (2021 – 2026)</h4>
                  </div>
                  <span className="text-xs text-slate-500">tCO₂e cumulative</span>
                </div>
                <div className="h-56">
                  <Line data={carbonChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Chart 2: Grid of NDVI & Biodiversity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Satellite NDVI & Canopy Density</h4>
                  <div className="h-48">
                    <Line
                      data={ndviChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          yNDVI: { type: 'linear', position: 'left', min: 0, max: 1 },
                          yCanopy: { type: 'linear', position: 'right', min: 0, max: 100 }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Biodiversity Score & Soil Carbon</h4>
                  <div className="h-48">
                    <Bar data={biodiversityChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
