import { useState } from 'react';
import { Droplet, MapPin, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { useTranslation } from '../utils/useTranslation';
import { useNavigate } from 'react-router-dom';

const WATER_STATIONS = [
  {
    id: 'W1',
    name: 'Water Station — Gate A Concourse',
    zone: 'Gate A / North Stand',
    level: 'Ground Floor',
    status: 'open',
    isAccessible: true,
    notes: 'Near Gate A entrance. Wheelchair accessible.',
    walkTime: '2 min from Gate A',
    mapNode: 'Gate A',
  },
  {
    id: 'W2',
    name: 'Water Station — Concourse West',
    zone: 'West Concourse',
    level: 'Concourse Level',
    status: 'open',
    isAccessible: true,
    notes: 'Between sections 201–210. Step-free access.',
    walkTime: '3 min from Gate B',
    mapNode: 'Concourse West',
  },
  {
    id: 'W3',
    name: 'Water Station — Concourse East',
    zone: 'East Concourse',
    level: 'Concourse Level',
    status: 'open',
    isAccessible: false,
    notes: 'Near Restroom R2. Two steps up from main concourse.',
    walkTime: '4 min from Gate D',
    mapNode: 'Concourse East',
  },
  {
    id: 'W4',
    name: 'Main Water Point — Food Court',
    zone: 'Food Court Hub',
    level: 'Upper Concourse',
    status: 'open',
    isAccessible: true,
    notes: 'Largest station. Free refills for bottle holders.',
    walkTime: '5 min from Section 214',
    mapNode: 'Food Court',
  },
  {
    id: 'W5',
    name: 'Water Kiosk — Medical Zone',
    zone: 'Medical & First Aid Area',
    level: 'Ground Floor',
    status: 'open',
    isAccessible: true,
    notes: 'Adjacent to Medical Desk. Priority for medical staff.',
    walkTime: '3 min from Section 214',
    mapNode: 'Medical Desk',
  },
  {
    id: 'W6',
    name: 'Water Point — Metro Exit 3',
    zone: 'Transport / Exit Zone',
    level: 'Ground Floor',
    status: 'limited',
    isAccessible: true,
    notes: 'Small station. May have short queue after final whistle.',
    walkTime: '2 min from Metro Exit 3',
    mapNode: 'Metro Exit 3',
  },
];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-pitchGreen', bg: 'bg-pitchGreen/10 border-pitchGreen/30', icon: CheckCircle },
  limited: { label: 'Limited', color: 'text-alertAmber', bg: 'bg-alertAmber/10 border-alertAmber/30', icon: AlertCircle },
  closed: { label: 'Closed', color: 'text-criticalRed', bg: 'bg-criticalRed/10 border-criticalRed/30', icon: AlertCircle },
};

export default function WaterStationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filterAccessible, setFilterAccessible] = useState(false);

  const filtered = filterAccessible ? WATER_STATIONS.filter(s => s.isAccessible) : WATER_STATIONS;
  const openCount = WATER_STATIONS.filter(s => s.status === 'open').length;

  const handleNavigate = (node) => {
    navigate('/smart-navigation', {
      state: { startNode: 'Gate B', destinationNode: node, prefOverride: 'shortest' }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20">
          <Droplet size={22} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">
            {t('Water Stations')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('All refill points across the venue')} &mdash; {openCount} {t('currently open')}
          </p>
        </div>
      </div>

      {/* Accessibility filter */}
      <div className="flex items-center gap-2">
        <button
          aria-pressed={filterAccessible}
          onClick={() => setFilterAccessible(v => !v)}
          className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
            filterAccessible
              ? 'bg-sky-600 border-sky-500 text-white'
              : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          <span>{t('Accessible Only')}</span>
        </button>
        <span className="text-xs text-slate-500">{filtered.length} {t('stations shown')}</span>
      </div>

      {/* Station cards */}
      <div className="space-y-3">
        {filtered.map(station => {
          const cfg = STATUS_CONFIG[station.status] ?? STATUS_CONFIG.open;
          const StatusIcon = cfg.icon;

          return (
            <div
              key={station.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-sky-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 flex-shrink-0 mt-0.5">
                    <Droplet size={16} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">{t(station.name)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="flex items-center space-x-1 text-xs text-slate-400">
                        <MapPin size={10} className="flex-shrink-0" />
                        <span>{t(station.zone)}</span>
                      </span>
                      <span className="text-xs text-slate-500">{t(station.level)}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon size={10} />
                  <span>{t(cfg.label)}</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{t(station.notes)}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Navigation size={10} />
                    <span>{t(station.walkTime)}</span>
                  </span>
                  {station.isAccessible && (
                    <span className="flex items-center space-x-1 text-indigo-400 font-semibold">
                      <CheckCircle size={10} />
                      <span>{t('Wheelchair accessible')}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleNavigate(station.mapNode)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/30 text-sky-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Navigation size={11} />
                  <span>{t('Get Directions')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info notice */}
      <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-xl text-xs text-sky-300/70 leading-relaxed">
        💧 {t('All water points provide free drinking water. Bring a reusable bottle. Accessibility icons indicate step-free access.')}
      </div>
    </div>
  );
}
