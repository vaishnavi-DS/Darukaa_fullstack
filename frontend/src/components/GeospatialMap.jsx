import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Maximize, RefreshCw, CheckCircle2, AlertTriangle, Crosshair, ZoomIn } from 'lucide-react';

// Fix default Leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function GeospatialMap({ sites, onSelectSite, onPolygonDrawn, isDrawingMode, setIsDrawingMode, selectedProject }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerGroupRef = useRef(null);
  const drawPolylineRef = useRef(null);
  const [mapTile, setMapTile] = useState('street'); // street | satellite
  const [drawnCoords, setDrawnCoords] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(0);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: India / Western Ghats region [15.0, 78.0]
    const map = L.map(mapContainerRef.current, {
      center: [15.0, 78.0],
      zoom: 5,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | Darukaa.Earth'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    streetLayer.addTo(map);

    mapInstanceRef.current = map;
    mapInstanceRef.current._streetLayer = streetLayer;
    mapInstanceRef.current._satelliteLayer = satelliteLayer;

    polygonLayerGroupRef.current = L.layerGroup().addTo(map);

    // Force map tile recalculation to prevent white/gray blank canvas
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle tile switch (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (mapTile === 'satellite') {
      if (map.hasLayer(map._streetLayer)) map.removeLayer(map._streetLayer);
      if (!map.hasLayer(map._satelliteLayer)) map.addLayer(map._satelliteLayer);
    } else {
      if (map.hasLayer(map._satelliteLayer)) map.removeLayer(map._satelliteLayer);
      if (!map.hasLayer(map._streetLayer)) map.addLayer(map._streetLayer);
    }
  }, [mapTile]);

  // Render Site Polygons on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current) return;

    polygonLayerGroupRef.current.clearLayers();

    // Filter sites if a specific project is selected ("Visited")
    const displaySites = selectedProject
      ? (sites || []).filter(s => s.project_id === selectedProject.id)
      : (sites || []);

    if (displaySites.length === 0) return;

    const bounds = L.latLngBounds();

    displaySites.forEach((site) => {
      try {
        let geom = site.geometry_json;
        if (typeof geom === 'string') {
          geom = JSON.parse(geom);
        }

        if (geom && geom.type === 'Polygon' && geom.coordinates) {
          const leafletCoords = geom.coordinates[0].map(coord => [coord[1], coord[0]]);
          leafletCoords.forEach(pt => bounds.extend(pt));

          let fillColor = '#10b981'; // Healthy Emerald
          let borderColor = '#059669';
          if (site.status === 'Monitoring Needed') {
            fillColor = '#f59e0b';
            borderColor = '#d97706';
          } else if (site.status === 'Degraded') {
            fillColor = '#ef4444';
            borderColor = '#dc2626';
          }

          const polygon = L.polygon(leafletCoords, {
            color: borderColor,
            weight: 2.5,
            fillColor: fillColor,
            fillOpacity: 0.45,
          });

          const popupHtml = `
            <div style="padding: 10px; font-family: Inter, sans-serif; min-width: 210px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">
                  ${site.site_code || 'SITE'}
                </span>
                <span style="font-size: 11px; font-weight: 600; color: #059669;">${site.status}</span>
              </div>
              <h4 style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 0 0 6px 0;">${site.name}</h4>
              <div style="font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.5;">
                <div>Area: <strong style="color: #0f172a;">${site.area_hectares} Ha</strong></div>
                <div>Carbon Density: <strong style="color: #0f172a;">${site.carbon_density_per_ha} tCO₂e/Ha</strong></div>
              </div>
              <button id="inspect-site-${site.id}" style="width: 100%; background: #0f172a; color: white; border: none; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 6px; cursor: pointer;">
                Inspect Site Analytics &rarr;
              </button>
            </div>
          `;

          polygon.bindPopup(popupHtml);

          polygon.on('popupopen', () => {
            const btn = document.getElementById(`inspect-site-${site.id}`);
            if (btn) {
              btn.onclick = () => onSelectSite(site);
            }
          });

          polygon.on('mouseover', function () {
            this.setStyle({ fillOpacity: 0.7, weight: 3.5 });
          });
          polygon.on('mouseout', function () {
            this.setStyle({ fillOpacity: 0.45, weight: 2.5 });
          });

          polygonLayerGroupRef.current.addLayer(polygon);
        }
      } catch (err) {
        console.error('Error parsing site geometry:', err);
      }
    });

    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sites, selectedProject]);

  // Handle Manual Polygon Drawing Mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (!isDrawingMode) return;

      const { lat, lng } = e.latlng;
      setDrawnCoords((prev) => {
        const updated = [...prev, [lng, lat]];

        if (drawPolylineRef.current) {
          map.removeLayer(drawPolylineRef.current);
        }

        const latLngs = updated.map(pt => [pt[1], pt[0]]);
        if (updated.length > 2) {
          drawPolylineRef.current = L.polygon(latLngs, {
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.45,
            dashArray: '5, 5'
          }).addTo(map);

          const approxHa = Math.round((latLngs.length * 12.5) * 10) / 10;
          setCalculatedArea(approxHa);
        } else {
          drawPolylineRef.current = L.polyline(latLngs, { color: '#2563eb', weight: 3 }).addTo(map);
        }

        return updated;
      });
    };

    if (isDrawingMode) {
      map.on('click', handleMapClick);
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
      if (drawPolylineRef.current) {
        map.removeLayer(drawPolylineRef.current);
        drawPolylineRef.current = null;
      }
      setDrawnCoords([]);
      setCalculatedArea(0);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode]);

  const handleFinishDrawing = () => {
    if (drawnCoords.length < 3) {
      alert('Please click at least 3 points on the map to create a polygon.');
      return;
    }
    const closedCoords = [...drawnCoords, drawnCoords[0]];
    const geoJsonPolygon = {
      type: 'Polygon',
      coordinates: [closedCoords]
    };
    onPolygonDrawn(geoJsonPolygon);
    setIsDrawingMode(false);
  };

  const handleClearDrawing = () => {
    setDrawnCoords([]);
    setCalculatedArea(0);
    if (drawPolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(drawPolylineRef.current);
      drawPolylineRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl border border-slate-200 bg-slate-100 shadow-sm overflow-hidden">
      
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-slate-200 shadow-md">
        <button
          onClick={() => setMapTile('street')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mapTile === 'street' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Street View
        </button>
        <button
          onClick={() => setMapTile('satellite')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mapTile === 'satellite' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Satellite Hybrid
        </button>
      </div>

      {/* Visited Project Banner Overlay */}
      {selectedProject && (
        <div className="absolute top-4 left-64 z-20 bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Viewing Sites for: {selectedProject.name}</span>
        </div>
      )}

      {/* Polygon Drawing Control Panel Overlay */}
      {isDrawingMode && (
        <div className="absolute top-4 right-14 z-20 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-emerald-300 shadow-lg max-w-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 mb-2">
            <Crosshair className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Drawing Site Boundary</h4>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Click points on the map to define your project site perimeter.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs mb-3">
            <p className="text-emerald-800 font-semibold">Points Clicked: {drawnCoords.length}</p>
            <p className="text-emerald-700">Estimated Area: <strong>~{calculatedArea} Ha</strong></p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFinishDrawing}
              disabled={drawnCoords.length < 3}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-md transition-colors"
            >
              Save Site Polygon
            </button>
            <button
              onClick={handleClearDrawing}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Interactive Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[620px]" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs flex items-center space-x-4">
        <span className="font-semibold text-slate-700">Site Status:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Healthy</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Monitoring Needed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Degraded</span>
        </div>
      </div>

    </div>
  );
}
