import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import StatusBadge from '../components/StatusBadge';
import AlertCard from '../components/AlertCard';
import {
  Calendar,
  MapPin,
  Compass,
  AlertTriangle,
  Accessibility,
  Bus,
  Loader2,
  Navigation,
  UtensilsCrossed,
  CupSoda
} from 'lucide-react';
import axios from 'axios';

export default function FanHomePage() {
  const { user } = useAuth();
  const { routePreference } = useAccessibility();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const navigate = useNavigate();

  // Load live alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/alerts`, { timeout: 3000 });
        setAlerts(response.data.slice(0, 2));
      } catch (err) {
        // Keep previous alerts on error
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (dest, pref) => {
    navigate('/smart-navigation', {
      state: { startNode: 'Gate B', destinationNode: dest, prefOverride: pref }
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">

      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 md:p-4 bg-stadiumNavy/40 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-base md:text-xl font-bold text-white">
            {t("Welcome to the")} {user?.displayName?.split(' ')[0] || t(' 🎉')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
            {t("Live matchday guidance — verified from stadium operations.")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">{t("Status:")}</span>
          <StatusBadge status="open" text={t("Match started")} />
        </div>
      </div>

      {/* Main Grid: Ticket + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">

        {/* Match Ticket Card */}
        <div className="operations-card accent-navigation p-4 md:p-5 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-bold text-navAccent uppercase tracking-wider">{t("Matchday Pass")}</span>

          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg md:text-2xl font-black text-white">{t("Brazil vs Germany")}</h3>
            <div className="flex flex-col gap-1 text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1.5">
                <Calendar size={11} className="text-slate-400 flex-shrink-0" />
                <span>{t("July 8, 2026 · 7:30 PM")}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                <span>{t("Tournament Venue · Section 214")}</span>
              </span>
            </div>
          </div>

          {/* Seat coordinates */}
          <div className="grid grid-cols-3 gap-2 bg-black/30 p-2.5 rounded-xl border border-slate-800/60 text-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">{t("Gate")}</span>
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">{t("Section")}</span>
              <span className="text-sm font-bold text-white">214</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">{t("Seat")}</span>
              <span className="text-sm font-bold text-white">6-14</span>
            </div>
          </div>
        </div>

        {/* Live Stadium Status */}
        <div className="operations-card accent-safety p-4 md:p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-2">{t("Venue Status")}</h3>
          <div className="space-y-2">
            {[
              {
                label: t("Gate B (Your Entrance)"),
                status: "crowded",
                text: t("High Crowd")
              },
              {
                label: t("Gate D (Alternative)"),
                status: "open",
                text: t("Very Low Queue")
              },
              {
                label: t("Restroom R2 (Accessible)"),
                status: "warning",
                text: t("Moderate queue")
              },
              {
                label: t("Metro Exit 3"),
                status: "open",
                text: t("Normal Movement")
              }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                <span className="text-xs font-semibold text-slate-300 truncate mr-2">{item.label}</span>
                <StatusBadge status={item.status} text={item.text} />
              </div>
            ))}

          </div>
          <p className="text-[9px] text-slate-500 italic">{t("Updated from authorized operational reports.")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("Quick Actions")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {[
            { emoji: '🎫', label: t("Find My Seat"), dest: 'Section 214', pref: routePreference },
            { emoji: '♿', label: t("Accessible Toilet"), dest: 'Restroom R2', pref: 'wheelchair' },
            { emoji: '🚨', label: t("Medical Desk"), dest: 'Medical Desk', pref: routePreference },
            { emoji: '🚇', label: t("Transport Exit"), dest: 'Metro Exit 3', pref: 'least_crowded' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.dest, action.pref)}
              className="p-3 md:p-4 bg-stadiumNavy/60 border border-slate-800 hover:border-electricBlue/60 rounded-xl text-center space-y-1.5 transition-all hover:scale-[1.02] cursor-pointer active:scale-95"
            >
              <span className="text-lg md:text-xl block">{action.emoji}</span>
              <span className="text-[11px] md:text-xs font-bold text-white block leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Route */}
      <div className="operations-card accent-transport p-4 md:p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <Navigation size={16} className="text-electricBlue flex-shrink-0" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("Recommended Route")}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t("Gate B is crowded. Enter via")} <strong className="text-white">{t("Gate D")}</strong> {t("→ walk through")} <strong className="text-white">{t("Concourse East")}</strong> {t("to bypass queues.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/smart-navigation"
            className="px-3 py-1.5 bg-electricBlue hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all"
          >
            {t("Open Map")}
          </Link>
          <Link
            to="/transport-exit"
            className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1"
          >
            <Bus size={11} />
            <span>{t("Transit Planner")}</span>
          </Link>
        </div>
      </div>

      {/* Live Alerts */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("Live Alerts")}</h3>
          <Link to="/live-alerts" className="text-xs text-electricBlue hover:underline font-bold">{t("View All")}</Link>
        </div>

        {loadingAlerts ? (
          <div className="flex items-center space-x-2 text-xs text-slate-500 py-3">
            <Loader2 size={12} className="animate-spin" />
            <span>{t("Loading alerts...")}</span>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        ) : (
          <div className="p-3 border border-dashed border-slate-800 text-center text-xs text-slate-500 rounded-xl">
            {t("No active alerts for this zone.")}
          </div>
        )}
      </div>

      {/* Accessibility Shortcut */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 md:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400 border border-indigo-500/20 flex-shrink-0">
            <Accessibility size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t("Accessibility Controls")}</h4>
            <p className="text-xs text-slate-400">{t("Scale fonts, contrast, wheelchair routing.")}</p>
          </div>
        </div>
        <Link
          to="/accessibility"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg text-center shrink-0"
        >
          {t("Open")}
        </Link>
      </div>

    </div>
  );
}
