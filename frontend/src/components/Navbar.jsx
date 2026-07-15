import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import {
  ShieldAlert,
  Sun,
  Moon,
  Eye,
  Type,
  Languages,
  LogOut,
  Menu,
  Volume2,
  VolumeX,
  UserCheck,
  Bell,
} from 'lucide-react';

export default function Navbar({ showHamburger = false, onHamburgerClick }) {
  const { user, logout } = useAuth();
  const {
    highContrast, setHighContrast,
    textScale, setTextScale,
    speechEnabled, setSpeechEnabled,
    language, setLanguage,
    theme, setTheme
  } = useAccessibility();
  const { t } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLangOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    const fetchAlertCount = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/alerts`, { timeout: 3000 });
        if (Array.isArray(response.data)) setActiveAlertCount(response.data.length);
      } catch (err) { /* silent */ }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const getAlertsLink = () => {
    if (user && ['volunteer', 'staff', 'organizer'].includes(user.role)) return '/alert-approval';
    return '/live-alerts';
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  const handleEmergencySOS = () => {
    setSosActive(true);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const alarm = new SpeechSynthesisUtterance("SOS emergency broadcast triggered. Security and medical personnel have been notified.");
      window.speechSynthesis.speak(alarm);
    }
  };

  return (
    <>
      <nav className="operations-card rounded-none sticky top-0 z-50 px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between border-b border-white/5">

        {/* Left: Hamburger (staff mobile) + Brand */}
        <div className="flex items-center space-x-2 min-w-0">
          {/* Hamburger for staff on mobile */}
          {showHamburger && (
            <button
              onClick={onHamburgerClick}
              className="md:hidden p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
          )}

          {/* Brand */}
          <div className="flex items-center space-x-2 select-none min-w-0">
            <div className="bg-electricBlue text-white p-1.5 md:p-2 rounded-lg font-bold flex items-center justify-center flex-shrink-0 text-sm md:text-base">
              🏟️
            </div>
            <span className="font-extrabold text-base md:text-xl tracking-tight text-white truncate">
              Stadium<span className="text-electricBlue">Pulse</span>
            </span>
          </div>

          {/* Role badge — desktop only */}
          {user && (
            <span className="hidden lg:inline-flex items-center bg-stadiumNavy border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-300 space-x-1 flex-shrink-0">
              <UserCheck size={11} className="text-pitchGreen" />
              <span>{user.role.toUpperCase()}</span>
            </span>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">

          {/* SOS — always visible */}
          <button
            onClick={handleEmergencySOS}
            className="bg-criticalRed hover:bg-red-600 text-white font-bold px-2 py-1.5 md:px-3 rounded-lg flex items-center space-x-1 text-xs animate-pulse flex-shrink-0"
            aria-label="Trigger Emergency SOS"
          >
            <ShieldAlert size={14} />
            <span className="hidden sm:inline text-xs">SOS</span>
          </button>

          {/* Alert bell */}
          {user && (
            <Link
              to={getAlertsLink()}
              className="p-1.5 md:p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white relative flex items-center justify-center flex-shrink-0"
              title="Active Alerts"
            >
              <Bell size={15} />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[8px] font-black text-white items-center justify-center">
                    {activeAlertCount > 9 ? '9+' : activeAlertCount}
                  </span>
                </span>
              )}
            </Link>
          )}

          {/* Theme toggle — visible on sm+ */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:flex p-1.5 md:p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white items-center justify-center cursor-pointer transition-all flex-shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} className="text-alertAmber" /> : <Moon size={15} className="text-purple-400" />}
          </button>

          {/* High contrast — visible on md+ */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`hidden md:flex p-1.5 md:p-2 rounded-lg border items-center justify-center cursor-pointer flex-shrink-0 ${highContrast ? 'bg-white text-black border-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
            title="Toggle High Contrast"
          >
            <Eye size={15} />
          </button>

          {/* Text scale — visible on lg+ */}
          <button
            onClick={() => {
              if (textScale === 'normal') setTextScale('large');
              else if (textScale === 'large') setTextScale('extra');
              else setTextScale('normal');
            }}
            className="hidden lg:flex p-1.5 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white items-center space-x-1 flex-shrink-0"
            title="Adjust Text Size"
          >
            <Type size={14} />
            <span className="text-[10px] font-bold">{textScale === 'normal' ? '1x' : textScale === 'large' ? '1.15x' : '1.3x'}</span>
          </button>

          {/* Speech toggle — visible on lg+ */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`hidden lg:flex p-1.5 md:p-2 rounded-lg border items-center justify-center cursor-pointer flex-shrink-0 ${speechEnabled ? 'bg-electricBlue border-electricBlue text-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
            title="Toggle Speech Assistance"
          >
            {speechEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-1.5 md:p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 flex-shrink-0"
              title="Choose Language"
            >
              <Languages size={15} />
              <span className="hidden xl:inline text-xs font-medium">{language}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-stadiumNavy border border-slate-700 shadow-2xl overflow-hidden z-50">
                {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-electricBlue hover:text-white flex items-center justify-between ${language === lang ? 'bg-slate-700 text-white' : 'text-slate-300'}`}
                  >
                    <span>{lang}</span>
                    {language === lang && <span className="text-[8px] font-black text-electricBlue">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          {user ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-1.5 md:p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-criticalRed hover:bg-criticalRed hover:text-white transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-electricBlue hover:bg-blue-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* SOS Modal */}
      {sosActive && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <div className="bg-stadiumNavy border-2 border-criticalRed rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-criticalRed flex items-center space-x-2 mb-3">
              <ShieldAlert size={22} className="animate-bounce" />
              <span>SOS Emergency Triggered</span>
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              An emergency warning has been logged. Security and medical services are dispatching assistance now.
            </p>
            <div className="bg-black/40 p-3 rounded-lg border border-red-500/20 mb-4 text-xs font-mono text-slate-400">
              GPS: Lat 40.8135, Long -74.0743<br />
              Ticket: Sec 214, Row 6, Seat 14
            </div>
            <button
              onClick={() => setSosActive(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg text-sm transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
