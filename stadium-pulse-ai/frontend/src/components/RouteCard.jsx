import React from 'react';
import SourceBadge from './SourceBadge';
import { 
  Milestone, 
  Flame, 
  Accessibility, 
  ShieldCheck, 
  Compass, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function RouteCard({ route }) {
  if (!route) return null;

  const getPreferenceIcon = () => {
    switch (route.preference) {
      case 'wheelchair':
        return <Accessibility size={18} className="text-pitchGreen" />;
      case 'least_crowded':
        return <Flame size={18} className="text-alertAmber" />;
      case 'emergency':
        return <ShieldCheck size={18} className="text-criticalRed" />;
      default:
        return <Compass size={18} className="text-electricBlue" />;
    }
  };

  const getPreferenceName = () => {
    switch (route.preference) {
      case 'wheelchair': return 'Wheelchair Accessible Route';
      case 'least_crowded': return 'Least Congested Route';
      case 'emergency': return 'Emergency Exit Route';
      case 'family': return 'Stroller/Family Route';
      default: return 'Fastest Route';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-700 glass-panel space-y-4">
      {/* Route Title & Pref */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          {getPreferenceIcon()}
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              {getPreferenceName()}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Stadium Navigation Engine
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-electricBlue">
            {route.totalDistance}
          </span>
        </div>
      </div>

      {/* Stair Alert Warning */}
      {route.hasStairs && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-alertAmber">
          <AlertTriangle size={16} className="shrink-0" />
          <span>This path contains stairs. Switch to <strong className="text-alertAmber font-bold">Wheelchair Mode</strong> if you require elevator or ramp access.</span>
        </div>
      )}

      {/* Path Node Sequence */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
          Directions (Sequence of Verified Locations)
        </span>
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-black bg-opacity-35 rounded-xl border border-slate-800/80">
          {route.path.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-xs font-bold text-white">{node.id}</span>
                <span className="text-[9px] text-slate-400 capitalize">{node.type}</span>
              </div>
              {index < route.path.length - 1 && (
                <ArrowRight size={14} className="text-slate-500 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Routing Reasoning Explanation */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
          AI Navigation Insights
        </span>
        <p className="text-xs text-slate-300 bg-stadiumNavy/40 p-3 rounded-lg border border-slate-800 leading-relaxed font-medium">
          {route.reason}
        </p>
      </div>

      {/* Footnote Source citation */}
      <div className="pt-1">
        <SourceBadge source={route.source} />
      </div>
    </div>
  );
}
