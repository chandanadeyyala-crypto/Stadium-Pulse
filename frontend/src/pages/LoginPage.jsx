import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import { SunMoon, Type, Languages, ShieldCheck, Navigation } from 'lucide-react';
import soccerBall from '../assets/soccer-ball.svg';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signInAsDemoRole } = useAuth();
  const { highContrast, setHighContrast, textScale, setTextScale, language, setLanguage } = useAccessibility();
  const { t } = useTranslation();

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
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-900 ${highContrast ? 'bg-black' : ''} text-slate-100`}>
      {/* Left visual panel - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-slate-950 flex-col items-center justify-center p-8 relative overflow-hidden border-r border-slate-800">

        {/* Subtle stadium-grid or route-line background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(47, 128, 237, 0.25)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M -50 150 Q 120 300 350 180 T 800 200" fill="none" stroke="rgba(47, 128, 237, 0.35)" strokeWidth="1.5" strokeDasharray="5 5" />
            <path d="M 50 400 Q 250 250 450 450" fill="none" stroke="rgba(39, 174, 96, 0.25)" strokeWidth="1.5" strokeDasharray="5 5" />
          </svg>
        </div>

        <div className="z-10 flex flex-col items-center space-y-8 max-w-xs">
          {/* StadiumPulse AI branding */}
          <div className="flex items-center space-x-2">
            <div className="bg-electricBlue text-white p-2 rounded-lg font-bold">🏟️</div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              StadiumPulse <span className="text-electricBlue">AI</span>
            </span>
          </div>

          {/* Same animated soccer-ball visual */}
          <div className="ball-scene-container scale-95" aria-hidden="true">
            {/* Glow */}
            <div className="ball-glow" />

            {/* Orbits */}
            <div className="orbit-ring-container">
              <div className="orbit-ring-1" />
              <div className="orbit-ring-2" />
            </div>

            {/* Route Path */}
            <div className="route-path-container">
              <svg className="route-svg" viewBox="0 0 280 280">
                <path d="M 40,200 Q 140,50 240,200" fill="none" className="route-line" />
                <circle cx="40" cy="200" className="route-marker" />
                <circle cx="240" cy="200" className="route-marker-alt" />
              </svg>
            </div>

            {/* Soccer Ball */}
            <div className="ball-wrapper-anim">
              <img
                src={soccerBall}
                alt=""
                className="soccer-ball-img"
              />
            </div>
          </div>

          {/* Three small feature labels */}
          <div className="w-full space-y-3 pt-2">
            <div className="flex items-center space-x-3 bg-stadiumNavy/40 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md">
              <ShieldCheck size={16} className="text-pitchGreen shrink-0" />
              <span className="text-xs font-bold text-slate-200">{t('Verified navigation')}</span>
            </div>
            <div className="flex items-center space-x-3 bg-stadiumNavy/40 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md">
              <Languages size={16} className="text-alertAmber shrink-0" />
              <span className="text-xs font-bold text-slate-200">{t('Multilingual alerts')}</span>
            </div>
            <div className="flex items-center space-x-3 bg-stadiumNavy/40 border border-slate-800 rounded-xl px-4 py-2.5 shadow-md">
              <Navigation size={16} className="text-electricBlue shrink-0" />
              <span className="text-xs font-bold text-slate-200">{t('Crowd-aware routing')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - contains existing login card container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">

        {/* On mobile: smaller animated football above login card */}
        <div className="md:hidden flex justify-center mb-6" aria-hidden="true">
          <div className="ball-scene-container scale-75">
            {/* Glow */}
            <div className="ball-glow" />

            {/* Orbits */}
            <div className="orbit-ring-container">
              <div className="orbit-ring-1" />
              <div className="orbit-ring-2" />
            </div>

            {/* Soccer Ball */}
            <div className="ball-wrapper-anim">
              <img
                src={soccerBall}
                alt=""
                className="soccer-ball-img"
              />
            </div>
          </div>
        </div>

        {/* Existing login card */}
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="bg-electricBlue text-white p-2 rounded-lg font-bold">🏟️</div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                StadiumPulse <span className="text-electricBlue">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("FIFA WC 2026 Authentication Gateway")}
            </p>
          </div>

          {/* Accessibility Quick Toggles */}
          <div className="flex items-center justify-center space-x-2 bg-stadiumNavy/60 p-2.5 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer ${highContrast ? 'bg-white text-black border-white' : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'}`}
              title={t("Toggle High Contrast")}
            >
              <SunMoon size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (textScale === 'normal') setTextScale('large');
                else if (textScale === 'large') setTextScale('extra');
                else setTextScale('normal');
              }}
              className="p-2 rounded-lg bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
              title={t("Adjust Text Scale")}
            >
              <Type size={16} />
              <span className="text-xs font-bold">
                {textScale === 'normal' ? '1x' : textScale === 'large' ? '1.15x' : '1.3x'}
              </span>
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-stadiumNavy border border-slate-700 rounded-lg text-xs py-1.5 px-2 text-slate-300 outline-none cursor-pointer"
              title={t("Change Language")}
            >
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">{t("Email Address")}</label>
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
              <label className="text-xs font-bold text-slate-400 uppercase">{t("Password")}</label>
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
              className="w-full bg-electricBlue hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
            >
              {t("Sign In with Email")}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase">{t("or")}</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
                navigate('/fan-home');
              } catch (err) {
                alert(`Google Sign-In failed: ${err.message}`);
              }
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">G</span>
            <span>{t("Sign In with Google")}</span>
          </button>

          {/* Quick Access
 */}
          <div className="border-t border-slate-800 pt-4 text-center space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              {t("Quick Access")}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('fan')}
                className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-pitchGreen cursor-pointer"
              >
                {t("Continue as Fan")}
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('staff')}
                className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-alertAmber cursor-pointer"
              >
                {t("Continue as Staff")}
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('organizer')}
                className="px-3 py-1.5 bg-stadiumNavy hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-criticalRed cursor-pointer"
              >
                {t("Continue as Organiser")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
