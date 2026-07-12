import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibilityToggle from '../components/AccessibilityToggle';
import { 
  Settings, 
  User, 
  Languages, 
  Shield, 
  BellRing, 
  Lock, 
  LogOut,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu', 'Arabic', 'Portuguese'];
const NOTIFICATION_PREFS = [
  { id: 'crowd', label: 'Crowd Alerts', desc: 'Notify when gates reach high density' },
  { id: 'gate', label: 'Gate Updates', desc: 'Notify when gate status changes' },
  { id: 'transport', label: 'Transport Updates', desc: 'Notify about exit and transit congestion' },
  { id: 'accessibility', label: 'Accessibility Updates', desc: 'Notify about elevator or ramp status' },
  { id: 'emergency', label: 'Emergency Alerts', desc: 'Always receive critical alerts (cannot disable)' },
];

export default function SettingsPage() {
  const { user, logout, signInAsDemoRole } = useAuth();
  const { language, setLanguage, highContrast, setHighContrast, textScale, setTextScale, speechEnabled, setSpeechEnabled, routePreference, setRoutePreference } = useAccessibility();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({ crowd: true, gate: true, transport: true, accessibility: true, emergency: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <Settings className="text-slate-400" />
        <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <User size={13} /><span>Profile</span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-electricBlue/20 text-electricBlue border border-electricBlue/30 flex items-center justify-center text-2xl font-extrabold">
            {(user?.displayName || 'F')[0].toUpperCase()}
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">{user?.displayName || 'Demo Fan'}</h4>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
            <span className="text-[10px] uppercase font-bold text-electricBlue">{user?.role || 'fan'} mode</span>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <Languages size={13} /><span>Language</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${language === lang ? 'bg-electricBlue/20 border-electricBlue text-white' : 'bg-stadiumNavy border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <span>{lang}</span>
              {language === lang && <CheckCircle size={12} className="text-electricBlue" />}
            </button>
          ))}
        </div>
      </div>

      {/* Role Section */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <Shield size={13} /><span>Role &amp; Access</span>
        </h3>
        <p className="text-xs text-slate-400 font-medium">Current demo role: <strong className="text-white capitalize">{user?.role}</strong></p>
        <div className="flex flex-wrap gap-2">
          {['fan', 'volunteer', 'staff', 'organizer'].map(role => (
            <button
              key={role}
              onClick={() => signInAsDemoRole(role)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold capitalize transition-all ${
                user?.role === role
                  ? 'bg-electricBlue/20 border-electricBlue text-white font-bold'
                  : 'bg-stadiumNavy border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Switch to {role}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-semibold italic">In production, roles are managed via Firebase user claims.</p>
      </div>

      {/* Accessibility Section */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <span>♿</span><span>Accessibility</span>
        </h3>
        <AccessibilityToggle id="settings-contrast" label="High Contrast Mode" description="Maximises colour contrast for visibility." checked={highContrast} onChange={setHighContrast} />
        <AccessibilityToggle id="settings-tts" label="Voice Assistance (TTS)" description="Reads alerts and route instructions aloud." checked={speechEnabled} onChange={setSpeechEnabled} />
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">Text Size</label>
          <div className="flex space-x-2">
            {[['normal', '100%'], ['large', '115%'], ['extra', '130%']].map(([id, label]) => (
              <button key={id} onClick={() => setTextScale(id)} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${textScale === id ? 'bg-electricBlue border-electricBlue text-white' : 'bg-stadiumNavy border-slate-800 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">Default Route Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[['fastest', '⚡ Fastest'], ['least_crowded', '🔥 Least Crowded'], ['wheelchair', '♿ Wheelchair'], ['family', '👶 Family']].map(([id, label]) => (
              <button key={id} onClick={() => setRoutePreference(id)} className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${routePreference === id ? 'bg-electricBlue/20 border-electricBlue text-white' : 'bg-stadiumNavy border-slate-800 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <BellRing size={13} /><span>Notification Preferences</span>
        </h3>
        {NOTIFICATION_PREFS.map(pref => (
          <AccessibilityToggle
            key={pref.id}
            id={`notif-${pref.id}`}
            label={pref.label}
            description={pref.desc}
            checked={notifications[pref.id]}
            onChange={(v) => {
              if (pref.id === 'emergency') return; // Cannot disable emergency alerts
              setNotifications(prev => ({ ...prev, [pref.id]: v }));
            }}
          />
        ))}
      </div>

      {/* Privacy Section */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
          <Lock size={13} /><span>Privacy</span>
        </h3>
        {['Delete My Session Data', 'Export My Data (GDPR)', 'View Privacy Policy'].map(item => (
          <button key={item} className="w-full py-3 px-4 bg-stadiumNavy border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-all">
            <span>{item}</span>
            <ChevronRight size={14} className="text-slate-600" />
          </button>
        ))}
      </div>

      {/* Save + Logout */}
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
        >
          {saved ? <><CheckCircle size={16} /><span>Saved!</span></> : <span>Save All Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className="px-5 py-3 bg-slate-800 hover:bg-criticalRed/20 border border-slate-700 hover:border-criticalRed/30 text-criticalRed font-bold rounded-xl text-sm transition-all flex items-center space-x-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
