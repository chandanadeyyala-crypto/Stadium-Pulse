import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  ShieldAlert, 
  SunMoon, 
  Type, 
  Languages, 
  LogOut, 
  Menu, 
  X,
  Volume2,
  VolumeX,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { 
    highContrast, setHighContrast, 
    textScale, setTextScale,
    speechEnabled, setSpeechEnabled,
    language, setLanguage 
  } = useAccessibility();
  
  const [langOpen, setLangOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const navigate = useNavigate();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  const handleEmergencySOS = () => {
    setSosActive(true);
    // Play sound placeholder
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const alarm = new SpeechSynthesisUtterance("SOS emergency broadcast triggered. Security and medical personnel have been notified of your location.");
      window.speechSynthesis.speak(alarm);
    }
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-electricBlue text-white p-2 rounded-lg font-bold flex items-center justify-center">
            🏟️
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            StadiumPulse <span className="text-electricBlue">AI</span>
          </span>
        </Link>
        {user && (
          <span className="hidden md:inline-flex items-center bg-stadiumNavy border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-300 space-x-1">
            <UserCheck size={12} className="text-pitchGreen" />
            <span>{user.role.toUpperCase()}</span>
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* SOS Emergency Button */}
        <button 
          onClick={handleEmergencySOS}
          className="bg-criticalRed hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 text-xs md:text-sm animate-pulse"
          aria-label="Trigger Emergency SOS help"
        >
          <ShieldAlert size={16} />
          <span className="hidden sm:inline">SOS HELP</span>
        </button>

        {/* Accessibility Quick Toggles */}
        {/* Contrast Toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`p-2 rounded-lg border text-xs ${highContrast ? 'bg-white text-black border-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
          title="Toggle High Contrast Mode"
        >
          <SunMoon size={16} />
        </button>

        {/* Text Scaling Cycle */}
        <button
          onClick={() => {
            if (textScale === 'normal') setTextScale('large');
            else if (textScale === 'large') setTextScale('extra');
            else setTextScale('normal');
          }}
          className="p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1"
          title="Adjust Text Scale Size"
        >
          <Type size={16} />
          <span className="text-xs font-bold">{textScale === 'normal' ? '1x' : textScale === 'large' ? '1.15x' : '1.3x'}</span>
        </button>

        {/* Speech Mode Toggle */}
        <button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          className={`p-2 rounded-lg border ${speechEnabled ? 'bg-electricBlue border-electricBlue text-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
          title="Toggle Speech Assistance (TTS)"
        >
          {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Language Selection */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1"
            title="Choose App Language"
          >
            <Languages size={16} />
            <span className="hidden md:inline text-xs font-medium">{language}</span>
          </button>
          
          {langOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg bg-stadiumNavy border border-slate-700 shadow-xl overflow-hidden z-50">
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-electricBlue hover:text-white ${language === lang ? 'bg-slate-700 text-white' : 'text-slate-300'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile / Logout */}
        {user ? (
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-criticalRed hover:bg-criticalRed hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-electricBlue hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg"
          >
            Login
          </Link>
        )}
      </div>

      {/* SOS Alert Modal */}
      {sosActive && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-stadiumNavy border-2 border-criticalRed rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-criticalRed flex items-center space-x-2 mb-3">
              <ShieldAlert size={24} className="animate-bounce" />
              <span>SOS Emergency Triggered</span>
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              An emergency warning has been logged with coordinates corresponding to your ticket location (**Section 214**). Security and medical services are dispatching assistance now.
            </p>
            <div className="bg-black bg-opacity-40 p-3 rounded-lg border border-red-500/20 mb-4 text-xs font-mono text-slate-400">
              GPS Location: Lat 40.8135, Long -74.0743<br/>
              Ticket Details: Sec 214, Row 6, Seat 14
            </div>
            <button
              onClick={() => setSosActive(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg text-sm transition-all"
            >
              Dismiss / Cancel Alarm
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
