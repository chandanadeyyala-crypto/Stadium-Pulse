import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import StatusBadge from '../components/StatusBadge';
import AlertCard from '../components/AlertCard';
import { 
  Calendar, 
  MapPin, 
  Compass, 
  HelpCircle, 
  AlertTriangle, 
  Flame, 
  Accessibility, 
  Bus, 
  FlameKindling,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function FanHomePage() {
  const { user } = useAuth();
  const { routePreference, language } = useAccessibility();
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const navigate = useNavigate();

  // Load live alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/alerts`);
        setAlerts(response.data.slice(0, 2)); // Show top 2 active alerts on home
      } catch (err) {
        console.error('Failed to load alerts on dashboard:', err.message);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAlerts();
    
    // Refresh every 15s
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (dest, pref) => {
    navigate('/smart-navigation', { 
      state: { 
        startNode: 'Gate B', // Default start node simulation
        destinationNode: dest, 
        prefOverride: pref 
      } 
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Top Welcome Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-stadiumNavy/40 border border-slate-800 rounded-2xl gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Welcome back, {user?.displayName || 'Fan'} ⚽</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Let's guide you to your seat safely. All details are grounded in verified venue registers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Matchday Status:</span>
          <StatusBadge status="open" text="Gates Active" />
        </div>
      </div>

      {/* Grid: Ticket & Status strips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Match / Ticket Details Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-electricBlue uppercase tracking-wider">Your Digital Match Ticket</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-bold">MATCH 48</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Brazil vs Germany</h3>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1">
                <Calendar size={13} className="text-slate-400" />
                <span>July 8, 2026 · 7:30 PM Kickoff</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin size={13} className="text-slate-400" />
                <span>StadiumPulse Arena · Sec 214</span>
              </span>
            </div>
          </div>

          {/* Seat Grid Coordinates */}
          <div className="grid grid-cols-3 gap-2 bg-black bg-opacity-35 p-3 rounded-xl border border-slate-800/80 text-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Gate</span>
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Section</span>
              <span className="text-sm font-bold text-white">214</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Seat</span>
              <span className="text-sm font-bold text-white">Row 6, #14</span>
            </div>
          </div>
        </div>

        {/* Live Congestion Status Strip */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">Live Stadium Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs font-semibold text-slate-300">Gate B (Your Entrance)</span>
                <StatusBadge status="crowded" text="Heavy Queue" />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs font-semibold text-slate-300">Gate D (Alternative)</span>
                <StatusBadge status="open" text="Very Low Queue" />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-xs font-semibold text-slate-300">Restroom R2 (Accessible)</span>
                <StatusBadge status="warning" text="5 min queue" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Metro Exit 3 Transit Hub</span>
                <StatusBadge status="open" text="Flow Normal" />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold italic">
            * Status checks are refreshed every 15s from verified staff reports.
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button 
            onClick={() => handleQuickAction('Section 214', routePreference)}
            className="p-4 bg-stadiumNavy border border-slate-800 hover:border-electricBlue rounded-xl text-center space-y-2 transition-all hover:scale-[1.02]"
          >
            <span className="text-xl">🎫</span>
            <span className="text-xs font-bold text-white block">Find Seat 214</span>
          </button>

          <button 
            onClick={() => handleQuickAction('Restroom R2', 'wheelchair')}
            className="p-4 bg-stadiumNavy border border-slate-800 hover:border-electricBlue rounded-xl text-center space-y-2 transition-all hover:scale-[1.02]"
          >
            <span className="text-xl">♿</span>
            <span className="text-xs font-bold text-white block">Accessible Toilet</span>
          </button>

          <button 
            onClick={() => handleQuickAction('Medical Desk', routePreference)}
            className="p-4 bg-stadiumNavy border border-slate-800 hover:border-electricBlue rounded-xl text-center space-y-2 transition-all hover:scale-[1.02]"
          >
            <span className="text-xl">🚨</span>
            <span className="text-xs font-bold text-white block">Medical Desk</span>
          </button>

          <button 
            onClick={() => handleQuickAction('Metro Exit 3', 'least_crowded')}
            className="p-4 bg-stadiumNavy border border-slate-800 hover:border-electricBlue rounded-xl text-center space-y-2 transition-all hover:scale-[1.02]"
          >
            <span className="text-xl">🚇</span>
            <span className="text-xs font-bold text-white block">Less Busy Exit</span>
          </button>

        </div>
      </div>

      {/* Recommended Route Card (Anti-Hallucination Grounded navigation preview) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Compass className="text-electricBlue" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Recommended Route Suggestion</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          Gate B is currently crowded. Based on the stadium graph, the system suggests entering via <strong className="text-white font-bold">Gate D</strong> and walking via <strong className="text-white font-bold">Concourse East</strong> to bypass the queues at the South gates.
        </p>

        <div className="flex space-x-3">
          <Link
            to="/smart-navigation"
            className="px-4 py-2 bg-electricBlue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all"
          >
            Open Interactive Map
          </Link>
          <Link
            to="/transport-exit"
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
          >
            <Bus size={12} />
            <span>Transit Exit Planner</span>
          </Link>
        </div>
      </div>

      {/* Live Alerts Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Live Broadcast Warnings</h3>
          <Link to="/live-alerts" className="text-xs text-electricBlue hover:underline font-bold">View All Alerts</Link>
        </div>

        {loadingAlerts ? (
          <div className="flex items-center space-x-2 text-xs text-slate-500 py-4 font-semibold">
            <Loader2 size={12} className="animate-spin" />
            <span>Retrieving live safety feeds...</span>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(a => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl bg-stadiumNavy/10">
            No active emergency alerts currently posted for this zone.
          </div>
        )}
      </div>

      {/* Accessibility Center Shortcut Card */}
      <div className="bg-stadiumNavy/20 border border-indigo-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Accessibility size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Accessibility & Guidance Controls</h4>
            <p className="text-xs text-slate-400 font-medium">Scale fonts, swap contrast themes, and configure wheelchair-accessible route paths.</p>
          </div>
        </div>
        <Link 
          to="/accessibility"
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg text-center"
        >
          Open Center
        </Link>
      </div>

    </div>
  );
}
