import { useState, useEffect } from 'react';
import axios from 'axios';
import AlertCard from '../components/AlertCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import {
  BellRing,
  RefreshCw,
  Filter,
  Radio
} from 'lucide-react';

export default function LiveAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/alerts`);
      setAlerts(response.data);
    } catch (err) {
      console.error('Failed to load active alerts:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const filterCategories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'crowd', label: '🔥 Crowd congestion' },
    { id: 'gate', label: '🚪 Gate entry' },
    { id: 'transport', label: '🚇 Transport' },
    { id: 'medical', label: '🚨 Medical support' },
    { id: 'accessibility', label: '♿ Access' },
    { id: 'emergency', label: '⚠️ Emergency' }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return (a.type || '').toLowerCase() === filter.toLowerCase();
  });

  const severityGroups = [
    { key: 'critical', label: 'Critical', icon: '🚨', borderClass: 'border-l-4 border-criticalRed', headerBg: 'bg-red-500/10 border-red-500/30', textColor: 'text-criticalRed' },
    { key: 'warning', label: 'Warning', icon: '⚠️', borderClass: 'border-l-4 border-alertAmber', headerBg: 'bg-amber-500/10 border-amber-500/30', textColor: 'text-alertAmber' },
    { key: 'info', label: 'Info', icon: 'ℹ️', borderClass: 'border-l-4 border-electricBlue', headerBg: 'bg-blue-500/10 border-blue-500/30', textColor: 'text-electricBlue' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">

      {/* Alerts Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellRing className="text-alertAmber" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Live Alerts</h1>
              <span className="flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full font-bold uppercase border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                <Radio size={10} className="animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Matchday Broadcast announcements</p>
          </div>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing || loading}
          className="p-2 bg-stadiumNavy border border-slate-800 rounded-xl text-slate-300 hover:text-white flex items-center space-x-1"
          title="Refresh Alert Logs"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span className="text-xs font-bold hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Severity Count Summary Bar — only when loaded */}
      {!loading && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs font-bold text-slate-400">
          <span>Total Active: <span className="text-white">{filteredAlerts.length}</span></span>
          <div className="flex gap-4">
            <span className="text-criticalRed">🚨 {filteredAlerts.filter(a => a.severity === 'critical').length} Critical</span>
            <span className="text-alertAmber">⚠️ {filteredAlerts.filter(a => a.severity === 'warning').length} Warning</span>
            <span className="text-electricBlue">ℹ️ {filteredAlerts.filter(a => a.severity === 'info').length} Info</span>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center space-x-2 bg-stadiumNavy/20 p-2.5 rounded-2xl border border-slate-800/80 overflow-x-auto select-none no-scrollbar">
        <Filter size={14} className="text-slate-500 shrink-0 ml-1.5" />
        <div className="flex space-x-1.5 shrink-0">
          {filterCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === cat.id
                ? 'bg-electricBlue text-white shadow-md'
                : 'bg-stadiumNavy text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <LoadingState message="Downloading active alerts from ops center..." />
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-6">
          {severityGroups.map(group => {
            const groupAlerts = filteredAlerts.filter(a => a.severity === group.key);
            if (groupAlerts.length === 0) return null;
            return (
              <div key={group.key} className="space-y-3">
                {/* Group header */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${group.headerBg}`}>
                  <span className="text-base">{group.icon}</span>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${group.textColor}`}>
                    {group.label}
                  </span>
                  <span className={`ml-auto text-xs font-black ${group.textColor} bg-black/20 px-2 py-0.5 rounded-full`}>
                    {groupAlerts.length} alert{groupAlerts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Indented alerts under left-border rail */}
                <div className={`pl-3 space-y-3 ${group.borderClass}`}>
                  {groupAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="All Clear!"
          message={`There are no active ${filter === 'all' ? '' : `'${filter}'`} operational warnings currently active in the arena.`}
          icon={BellRing}
        />
      )}

    </div>
  );
}
