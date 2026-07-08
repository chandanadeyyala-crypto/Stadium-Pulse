import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityToggle from '../components/AccessibilityToggle';
import { 
  Accessibility, 
  MapPin, 
  PhoneCall, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function AccessibilityPage() {
  const {
    highContrast, setHighContrast,
    textScale, setTextScale,
    speechEnabled, setSpeechEnabled,
    routePreference, setRoutePreference
  } = useAccessibility();
  
  const navigate = useNavigate();

  const handleRouteToFacility = (facilityId) => {
    // Navigate to map with wheelchair preference set and target set to the facility
    navigate('/smart-navigation', { 
      state: { 
        startNode: 'Gate B', // Simulation starting point
        destinationNode: facilityId, 
        prefOverride: 'wheelchair' 
      } 
    });
  };

  const facilities = [
    { id: 'Restroom R2', name: 'Wheelchair Restroom R2', location: 'Section 214 corridor', type: 'toilet' },
    { id: 'Medical Desk', name: 'First Aid Medical Station', location: 'Concourse East level', type: 'medical' },
    { id: 'Concourse East', name: 'Concourse Ramp & Elevator', location: 'Near Gate D entry', type: 'elevator' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex items-center space-x-2.5">
        <Accessibility className="text-electricBlue" />
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Accessibility Center</h1>
          <p className="text-[10px] uppercase font-semibold text-slate-400">Tailor your app display and routing needs</p>
        </div>
      </div>

      {/* Toggles Panel */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          Display & Speech Preferences
        </h3>

        <AccessibilityToggle
          id="high-contrast"
          label="High Contrast Mode"
          description="Increases contrast of fonts and backgrounds to full black/white values."
          checked={highContrast}
          onChange={setHighContrast}
        />

        <div className="p-4 rounded-xl bg-stadiumNavy/40 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">Text Font Size Size</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">{textScale.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', name: 'Normal (100%)' },
              { id: 'large', name: 'Large (115%)' },
              { id: 'extra', name: 'Extra (130%)' }
            ].map(scale => (
              <button
                key={scale.id}
                onClick={() => setTextScale(scale.id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  textScale === scale.id
                    ? 'bg-electricBlue border-electricBlue text-white'
                    : 'bg-stadiumNavy border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {scale.name}
              </button>
            ))}
          </div>
        </div>

        <AccessibilityToggle
          id="speech-tts"
          label="Voice Assistance (Text-To-Speech)"
          description="Plays sound readings of warnings and navigation instructions automatically."
          checked={speechEnabled}
          onChange={setSpeechEnabled}
        />
      </div>

      {/* Navigation Preference Selection */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
          Preferred Route Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setRoutePreference('wheelchair')}
            className={`p-4 rounded-2xl border text-left flex flex-col space-y-2 transition-all ${
              routePreference === 'wheelchair'
                ? 'bg-emerald-500/10 border-pitchGreen text-white'
                : 'bg-stadiumNavy/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">♿</span>
            <h4 className="text-xs font-extrabold text-white uppercase">Wheelchair Accessible</h4>
            <p className="text-[10px] text-slate-400 font-medium">Bypasses stairs and routes exclusively through ramp corridors and elevator bays.</p>
          </button>

          <button
            onClick={() => setRoutePreference('least_crowded')}
            className={`p-4 rounded-2xl border text-left flex flex-col space-y-2 transition-all ${
              routePreference === 'least_crowded'
                ? 'bg-amber-500/10 border-alertAmber text-white'
                : 'bg-stadiumNavy/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">🔥</span>
            <h4 className="text-xs font-extrabold text-white uppercase">Avoid Congestion</h4>
            <p className="text-[10px] text-slate-400 font-medium">Prioritizes low-crowd corridors based on dynamic staff traffic updates.</p>
          </button>
        </div>
      </div>

      {/* Nearest Facilities Locator Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nearest Verified Accessible Facilities</h3>
        
        <div className="space-y-2">
          {facilities.map((fac) => (
            <button
              key={fac.id}
              onClick={() => handleRouteToFacility(fac.id)}
              className="w-full p-4 rounded-2xl bg-stadiumNavy border border-slate-800 hover:border-electricBlue text-left flex items-center justify-between transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800 p-2 rounded-xl text-slate-400 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-electricBlue transition-colors">{fac.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{fac.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-bold text-electricBlue uppercase">
                <span>Route Now</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Critical Help Button */}
      <div className="bg-criticalRed/10 border border-criticalRed/30 p-4 rounded-3xl flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-white">Require Emergency Physical Help?</h4>
          <p className="text-[10px] text-slate-400 font-semibold">Press to dispatch a stadium assistance volunteer to your ticket seat position.</p>
        </div>
        
        <a
          href="tel:112"
          className="px-4 py-2 bg-criticalRed hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shrink-0"
        >
          <PhoneCall size={14} />
          <span>Call Security</span>
        </a>
      </div>

    </div>
  );
}
