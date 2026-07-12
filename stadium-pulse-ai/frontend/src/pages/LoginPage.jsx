import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  UserCheck, 
  ShieldAlert, 
  SunMoon, 
  Type, 
  Languages 
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signInAsDemoRole } = useAuth();
  const { 
    highContrast, setHighContrast, 
    textScale, setTextScale,
    language, setLanguage 
  } = useAccessibility();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate('/fan-home');
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleDemoSignIn = (role) => {
    signInAsDemoRole(role);
    if (['volunteer', 'staff', 'organizer'].includes(role)) {
      navigate('/staff-dashboard');
    } else {
      navigate('/fan-home');
    }
  };

  return (
    <div className="min-h-screen bg-primaryDark flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="bg-electricBlue text-white p-2 rounded-lg font-bold">🏟️</div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              StadiumPulse <span className="text-electricBlue">AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            FIFA WC 2026 Authentication Gateway
          </p>
        </div>

        {/* Accessibility Quick Toggles */}
        <div className="flex items-center justify-center space-x-2 bg-stadiumNavy/60 p-2.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg border flex items-center justify-center ${highContrast ? 'bg-white text-black border-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
            title="Toggle High Contrast"
          >
            <SunMoon size={16} />
          </button>

          <button
            onClick={() => {
              if (textScale === 'normal') setTextScale('large');
              else if (textScale === 'large') setTextScale('extra');
              else setTextScale('normal');
            }}
            className="p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1"
            title="Adjust Text Scale"
          >
            <Type size={16} />
            <span className="text-xs font-bold">{textScale === 'normal' ? '1x' : textScale === 'large' ? '1.15x' : '1.3x'}</span>
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-stadiumNavy border border-slate-700 rounded-lg text-xs py-1.5 px-2 text-slate-300 outline-none"
            title="Change Language"
          >
            {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="e.g. fan@worldcup2026.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-electricBlue outline-none font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-electricBlue outline-none font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-electricBlue hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg"
          >
            Sign In with Email
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase">or</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google sign-in */}
        <button
          onClick={async () => {
            try {
              await loginWithGoogle();
              navigate('/fan-home');
            } catch (err) {
              alert(`Google Sign-In failed: ${err.message}`);
            }
          }}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all"
        >
          {/* Mock Google Logo */}
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">G</span>
          <span>Sign In with Google</span>
        </button>

        <div className="border-t border-slate-800 pt-4 text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
            Rapid Sandbox Entrance (Bypass Login)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleDemoSignIn('fan')}
              className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-pitchGreen"
            >
              Demo Fan
            </button>
            <button
              onClick={() => handleDemoSignIn('staff')}
              className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-alertAmber"
            >
              Demo Staff
            </button>
            <button
              onClick={() => handleDemoSignIn('organizer')}
              className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-criticalRed"
            >
              Demo Organizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
