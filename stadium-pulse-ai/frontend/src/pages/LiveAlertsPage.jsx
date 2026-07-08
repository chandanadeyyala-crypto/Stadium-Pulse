import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertCard from '../components/AlertCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { 
  BellRing, 
  RefreshCw, 
  Filter, 
  Flame, 
  Bus, 
  Accessibility, 
  AlertTriangle 
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
    
    // Refresh alerts automatically every 10 seconds
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      
      {/* Alerts Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <BellRing className="text-alertAmber" />
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Live Alerts Board</h1>
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

      {/* Filter Chips Bar */}
      <div className="flex items-center space-x-2 bg-stadiumNavy/20 p-2.5 rounded-2xl border border-slate-800/80 overflow-x-auto select-none no-scrollbar">
        <Filter size={14} className="text-slate-500 shrink-0 ml-1.5" />
        <div className="flex space-x-1.5 shrink-0">
          {filterCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === cat.id
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
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
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
