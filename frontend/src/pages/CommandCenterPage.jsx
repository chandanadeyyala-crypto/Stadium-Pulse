import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import {
  Cpu,
  Activity,
  Map,
  BellRing,
  Users,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

const STADIUM_CENTER = [40.8135, -74.0743];

const NODE_COORDINATES = {
  "Gate A": [40.8145, -74.0750],
  "Gate B": [40.8125, -74.0755],
  "Gate D": [40.8130, -74.0730],
  "Concourse East": [40.8132, -74.0738],
  "Section 214": [40.8136, -74.0746],
  "Metro Exit 3": [40.8120, -74.0725]
};

const CROWD_HEAT = {
  "Gate A": { color: '#00B894', density: 0.2 },
  "Gate B": { color: '#EB5757', density: 0.9 },
  "Gate D": { color: '#00B894', density: 0.15 },
  "Concourse East": { color: '#F2C94C', density: 0.5 },
  "Section 214": { color: '#F2C94C', density: 0.6 },
  "Metro Exit 3": { color: '#00B894', density: 0.2 }
};

const createIcon = (color) => L.divIcon({
  html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}66"></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function CommandCenterPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataStatus, setDataStatus] = useState({
    venueData: 'online',
    staffReports: 'active',
    aiService: 'online',
    cache: 'active',
    maps: 'online'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const [alertsRes, healthRes] = await Promise.all([
          axios.get(`${backendUrl}/api/alerts`),
          axios.get(`${backendUrl}/health`)
        ]);
        setAlerts(alertsRes.data);
        if (healthRes.data.status === 'healthy') {
          setDataStatus(prev => ({ ...prev, aiService: 'online', venueData: 'online' }));
        }
      } catch (err) {
        setDataStatus(prev => ({ ...prev, aiService: 'offline', venueData: 'offline' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const aiRecommendations = [
    { text: 'Gate B approaching maximum density threshold. Recommend immediate fan diversion to Gate D.', severity: 'critical' },
    { text: 'Metro Exit 3 has 40% spare capacity. Broadcast preferred exit to reduce Lot C parking congestion.', severity: 'info' },
    { text: 'Section 214 restroom queue is moderate. No action required. Monitor for next 15 minutes.', severity: 'info' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <Cpu className="text-electricBlue" />
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Organizer Command Center</h1>
          <p className="text-[10px] uppercase font-semibold text-slate-400">Full venue operational intelligence overview</p>
        </div>
      </div>

      {/* Data Source Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(dataStatus).map(([key, status]) => {
          const labels = { venueData: 'Venue DB', staffReports: 'Staff Reports', aiService: 'AI Engine', cache: 'Cache Layer', maps: 'Map Tiles' };
          const isOnline = ['online', 'active'].includes(status);
          return (
            <div key={key} className={`p-3 rounded-xl border text-center transition-all ${isOnline ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-center space-x-1.5 mb-1">
                {isOnline ? <Wifi size={12} className="text-pitchGreen" /> : <WifiOff size={12} className="text-criticalRed" />}
                <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isOnline ? 'text-pitchGreen' : 'text-criticalRed'}`}>{status}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block">{labels[key]}</span>
            </div>
          );
        })}
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Venue Map with Crowd Heatmap Circles */}
        <div className="xl:col-span-2">
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center space-x-2">
              <Map size={15} className="text-electricBlue" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Live Crowd Heat Map</h3>
            </div>
            <div className="h-[360px]">
              <MapContainer center={STADIUM_CENTER} zoom={17} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.entries(NODE_COORDINATES).map(([name, coords]) => {
                  const heat = CROWD_HEAT[name];
                  return (
                    <React.Fragment key={name}>
                      <Marker position={coords} icon={createIcon(heat?.color || '#2F80ED')}>
                        <Popup>
                          <div className="font-sans p-1">
                            <strong>{name}</strong><br />
                            <span style={{ color: heat?.color }}>Density: {Math.round((heat?.density || 0) * 100)}%</span>
                          </div>
                        </Popup>
                      </Marker>
                      {heat && (
                        <Circle
                          center={coords}
                          radius={heat.density * 60}
                          pathOptions={{ color: heat.color, fillColor: heat.color, fillOpacity: 0.18, weight: 1 }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex items-center space-x-4 text-[10px] font-bold">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-pitchGreen inline-block" /><span className="text-slate-400">Low Density</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-alertAmber inline-block" /><span className="text-slate-400">Moderate</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-criticalRed inline-block" /><span className="text-slate-400">Critical</span></span>
            </div>
          </div>
        </div>

        {/* Right Column: AI + Alerts */}
        <div className="space-y-5">
          {/* AI Recommendations */}
          <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 space-y-4">
            <div className="flex items-center space-x-2">
              <Activity size={15} className="text-indigo-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {aiRecommendations.map((rec, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${rec.severity === 'critical' ? 'bg-red-500/5 border-red-500/20 text-slate-300' : 'bg-indigo-500/5 border-indigo-500/10 text-slate-400'}`}>
                  {rec.severity === 'critical' && <span className="text-criticalRed font-bold block mb-1">⚠ URGENT</span>}
                  {rec.text}
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <BellRing size={15} className="text-alertAmber" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Active Broadcasts</h3>
            </div>
            {loading ? (
              <LoadingState message="Loading alerts..." />
            ) : alerts.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No active broadcast alerts.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {alerts.map(a => (
                  <div key={a.id} className="p-3 bg-stadiumNavy/40 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={a.severity} text={a.severity} />
                      <span className="text-[10px] text-slate-500">{a.target}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed line-clamp-2">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Activity */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Users size={15} className="text-pitchGreen" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Staff Activity</h3>
            </div>
            {[
              { name: 'Ramesh Kumar', zone: 'Gate B redirect', status: 'active' },
              { name: 'Sarah Williams', zone: 'Elevator R&amp;D check', status: 'active' },
              { name: 'Chen Wei', zone: 'Section 214 medical assist', status: 'completed' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                <div>
                  <p className="text-xs font-bold text-white">{s.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium" dangerouslySetInnerHTML={{ __html: s.zone }} />
                </div>
                {s.status === 'active'
                  ? <CheckCircle size={14} className="text-pitchGreen" />
                  : <XCircle size={14} className="text-slate-600" />
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
