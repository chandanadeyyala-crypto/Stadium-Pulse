import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteCard from '../components/RouteCard';
import StatusBadge from '../components/StatusBadge';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Settings,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const STADIUM_CENTER = [40.8135, -74.0743];

const NODE_COORDINATES = {
  "Gate A": [40.8145, -74.0750],
  "Gate B": [40.8125, -74.0755],
  "Gate D": [40.8130, -74.0730],
  "Concourse West": [40.8138, -74.0752],
  "Concourse East": [40.8132, -74.0738],
  "Restroom R2": [40.8134, -74.0736],
  "Medical Desk": [40.8130, -74.0740],
  "Section 214": [40.8136, -74.0746],
  "Metro Exit 3": [40.8120, -74.0725],
  "Food Court": [40.8140, -74.0754],
  "Water Station": [40.8142, -74.0748],
  "Beverage Point": [40.8131, -74.0734],
  "Coffee Counter": [40.8129, -74.0736]
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const createCustomIcon = (color, char) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.4);">${char}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const ICONS = {
  gate: createCustomIcon('#00B894', 'G'),
  facility: createCustomIcon('#2F80ED', 'F'),
  section: createCustomIcon('#9b59b6', 'S'),
  transit: createCustomIcon('#f1c40f', 'T'),
  corridor: createCustomIcon('#7f8c8d', 'C')
};

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      map.panTo(coords[0], { animate: true });
    }
  }, [coords, map]);
  return null;
}

export default function SmartNavigationPage() {
  const locationState = useLocation().state || {};
  const { routePreference } = useAccessibility();
  const { t } = useTranslation();

  const [start, setStart] = useState(locationState.startNode || 'Gate B');
  const [end, setEnd] = useState(locationState.destinationNode || 'Section 214');
  const [preference, setPreference] = useState(locationState.prefOverride || routePreference);

  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.get(`${backendUrl}/api/alerts`);
        setAlerts(res.data);
      } catch (err) {
        console.warn('Failed to load alerts for map overlay:', err.message);
      }
    };
    loadAlerts();
  }, []);

  const handleCalculateRoute = async () => {
    if (start === end) {
      setError(t('Start and destination nodes cannot be identical.'));
      setRouteData(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('stadiumpulse_user')
        ? JSON.parse(localStorage.getItem('stadiumpulse_user')).token
        : '';

      const response = await axios.post(`${backendUrl}/api/routes/recommend`, {
        currentLocation: start,
        destination: end,
        routePreference: preference
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-demo-role': 'fan'
        }
      });

      if (response.data.success) {
        setRouteData(response.data);
      }
    } catch (err) {
      console.error('Route calculation error:', err.message);
      setError(err.response?.data?.message || t('Failed to calculate path. Verify connections.'));
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRoute();
  }, [start, end, preference]);

  const routePolylineCoords = routeData?.path
    ? routeData.path.map(node => NODE_COORDINATES[node.id]).filter(Boolean)
    : [];

  const nodeOptions = Object.keys(NODE_COORDINATES);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* Page Header */}
      <div className="flex items-center space-x-2">
        <Navigation className="text-pitchGreen" />
        <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">{t("Smart Navigation")}</h1>
      </div>

      {/* Grid: Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="operations-card accent-navigation p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800/40 flex items-center space-x-1">
              <Settings size={14} className="text-slate-400" />
              <span>{t("Route Planner Inputs")}</span>
            </h3>

            {/* Start Node */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Current Position")}</label>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-stadiumNavy border border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none cursor-pointer"
              >
                {nodeOptions.map(node => (
                  <option key={node} value={node}>{t(node)}</option>
                ))}
              </select>
            </div>

            {/* Destination Node */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Target Destination")}</label>
              <select
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-stadiumNavy border border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none cursor-pointer"
              >
                {nodeOptions.map(node => (
                  <option key={node} value={node}>{t(node)}</option>
                ))}
              </select>
            </div>

            {/* Route Preferences Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">{t("Route Mode Preference")}</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'fastest', name: t('⚡ Fastest Route') },
                  { id: 'least_crowded', name: t('🔥 Least Crowded') },
                  { id: 'wheelchair', name: t('♿ Wheelchair Accessible') },
                  { id: 'family', name: t('👶 Family Friendly') },
                  { id: 'emergency', name: t('🚨 Emergency Exit') }
                ].map(pref => (
                  <button
                    key={pref.id}
                    onClick={() => setPreference(pref.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${preference === pref.id
                      ? 'bg-electricBlue/20 border-electricBlue text-white shadow-lg'
                      : 'bg-stadiumNavy/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {pref.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-xs text-criticalRed rounded-lg flex items-center space-x-1.5">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Map Rendering Column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Active node crowd alert checks */}
          {alerts.some(a => a.target === start || a.target === end) && (
            <div className="bg-amber-500/15 border border-amber-500/30 p-3 rounded-2xl flex items-center space-x-2 text-xs text-alertAmber font-medium leading-relaxed">
              <AlertTriangle size={18} className="shrink-0 animate-bounce" />
              <span>{t("Warning: Active congestion warnings are reported at your selection nodes. Routing is recalculating bypass weights.")}</span>
            </div>
          )}

          {/* Leaflet Map Card */}
          <div className="h-[320px] md:h-[400px] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute inset-0 bg-primaryDark/60 backdrop-blur-sm z-30 flex items-center justify-center space-x-2 text-xs font-bold text-white">
                <Loader2 size={16} className="animate-spin text-electricBlue" />
                <span>{t("Rerouting pathway...")}</span>
              </div>
            )}

            <MapContainer
              center={STADIUM_CENTER}
              zoom={17}
              scrollWheelZoom={false}
              className="h-full w-full"
              style={{ background: "#08111F" }}
            >
              {/* Dark Styled Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRecenter coords={routePolylineCoords} />

              {/* Draw Route Path Polyline */}
              {routePolylineCoords.length > 0 && (
                <Polyline
                  positions={routePolylineCoords}
                  color={preference === 'wheelchair' ? '#00B894' : preference === 'emergency' ? '#EB5757' : '#2F80ED'}
                  weight={5}
                  opacity={0.85}
                  dashArray={preference === 'emergency' ? '10, 10' : undefined}
                />
              )}

              {/* Render verified markers */}
              {Object.entries(NODE_COORDINATES).map(([name, coords]) => {
                // Determine node type to get icon key
                let type = 'corridor';
                if (name.startsWith('Gate')) type = 'gate';
                else if (name.startsWith('Metro')) type = 'transit';
                else if (name.startsWith('Section')) type = 'section';
                else if (name.startsWith('Restroom') || name.startsWith('Medical')) type = 'facility';

                const icon = ICONS[type] || ICONS.corridor;

                return (
                  <Marker key={name} position={coords} icon={icon}>
                    <Popup className="stadium-popup">
                      <div className="p-1 space-y-1 font-sans">
                        <h4 className="text-xs font-bold text-slate-800">{t(name)}</h4>
                        <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1 rounded">{t(type)}</span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Route Explanation output Card */}
          {routeData && (
            <RouteCard route={routeData} />
          )}

        </div>

      </div>

    </div>
  );
}
