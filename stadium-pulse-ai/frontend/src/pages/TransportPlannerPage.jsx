import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { 
  Bus, 
  MapPin, 
  Leaf, 
  ArrowRight,
  TrendingDown,
  Navigation
} from 'lucide-react';

export default function TransportPlannerPage() {
  const navigate = useNavigate();

  const transportOptions = [
    { name: 'Metro Link Shuttle (Exit 3)', status: 'busy', wait: '15 min queue', eco: true, desc: 'Direct fast transit rail link to city center.' },
    { name: 'Matchday Bus Express', status: 'open', wait: '5 min queue', eco: true, desc: 'Park & Ride express buses to North parking lots.' },
    { name: 'Rideshare & Taxi Zone', status: 'critical', wait: '45 min wait', eco: false, desc: 'Heavily congested. High surge prices active.' },
    { name: 'General Parking West Lot', status: 'warning', wait: '20 min wait', eco: false, desc: 'Heavy outbound traffic locks near West gates.' }
  ];

  const handleRouteToExit = (destId) => {
    navigate('/smart-navigation', { 
      state: { 
        startNode: 'Section 214', // Match seat location
        destinationNode: destId, 
        prefOverride: 'least_crowded' 
      } 
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex items-center space-x-2.5">
        <Bus className="text-pitchGreen" />
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Transport & Exit Planner</h1>
          <p className="text-[10px] uppercase font-semibold text-slate-400">Exit the venue safely and efficiently</p>
        </div>
      </div>

      {/* Nearest Exit coordinates Card */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Your Recommended Egress Point</span>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Metro Exit 3 Transit Hub</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Based on your ticket seat position (**Section 214**), the fastest path is via **Concourse East** directly to **Gate D** and out to the metro platform.
            </p>
          </div>
          <button
            onClick={() => handleRouteToExit('Metro Exit 3')}
            className="px-3 py-2 bg-electricBlue hover:bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1"
          >
            <Navigation size={13} />
            <span>Map Exit</span>
          </button>
        </div>

        {/* Egress sequence steps */}
        <div className="bg-black bg-opacity-35 p-3 rounded-2xl border border-slate-800/80 mt-2 flex items-center justify-between text-center max-w-md">
          <div className="flex-1">
            <span className="text-[9px] font-bold text-slate-400">Seat Sec 214</span>
          </div>
          <ArrowRight size={12} className="text-slate-600" />
          <div className="flex-1">
            <span className="text-[9px] font-bold text-slate-400">Concourse East</span>
          </div>
          <ArrowRight size={12} className="text-slate-600" />
          <div className="flex-1">
            <span className="text-[9px] font-bold text-slate-400">Gate D Out</span>
          </div>
          <ArrowRight size={12} className="text-slate-600" />
          <div className="flex-1">
            <span className="text-[9px] font-bold text-pitchGreen">Metro Exit 3</span>
          </div>
        </div>
      </div>

      {/* Sustainable Travel Banner */}
      <div className="bg-emerald-500/10 border border-pitchGreen/20 p-4 rounded-3xl space-y-2">
        <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
          <Leaf size={16} className="text-pitchGreen" />
          <span>Eco-Friendly Transit Suggestion</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Choose the **Metro Link Shuttle**! It reduces matchday vehicular emissions by 85% compared to single-rider rideshares. Show your metro validator at checkout for a **15% discount coupon** at official World Cup retail stands.
        </p>
      </div>

      {/* Transit Options Directory */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Transit Choices</h3>
        
        <div className="space-y-3">
          {transportOptions.map((opt, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-700/60 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-white">{opt.name}</h4>
                  {opt.eco && (
                    <span className="inline-flex items-center space-x-0.5 text-[8px] font-bold text-pitchGreen bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      <Leaf size={8} />
                      <span>ECO</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{opt.desc}</p>
              </div>

              <div className="flex sm:flex-col items-end gap-2 shrink-0">
                <StatusBadge status={opt.status} text={opt.wait} />
                {opt.status !== 'critical' && (
                  <button
                    onClick={() => handleRouteToExit(opt.name.includes('Metro') ? 'Metro Exit 3' : opt.name.includes('Bus') ? 'Gate A' : 'Gate B')}
                    className="text-[10px] font-bold text-electricBlue hover:underline"
                  >
                    Walk Route
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
