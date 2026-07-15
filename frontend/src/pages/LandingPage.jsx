import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/useTranslation';
import { ShieldCheck, Navigation, Languages, Accessibility } from 'lucide-react';
import soccerBall from '../assets/soccer-ball.svg';
export default function LandingPage() {
  const navigate = useNavigate();
  const { signInAsDemoRole } = useAuth();
  const { t } = useTranslation();

  const handleDemoMode = (role) => {
    signInAsDemoRole(role);

    const destination = ['volunteer', 'staff', 'organizer'].includes(role)
      ? '/staff-dashboard'
      : '/fan-home';

    navigate(destination);
  };

  const DEMO_ROLES = [
    {
      role: 'fan',
      emoji: '🎫',
      label: 'Fan Experience',
      desc: 'Find your seat, explore venue services and receive matchday guidance',
      color: 'border-electricBlue/40 hover:border-electricBlue',
    },
    {
      role: 'staff',
      emoji: '🛡️',
      label: 'Venue operations',
      desc: 'Report incidents, coordinate responses and manage public alerts',
      color: 'border-alertAmber/40 hover:border-alertAmber',
    },
    {
      role: 'organizer',
      emoji: '⚡',
      label: 'Operations Command Center',
      desc: 'Monitor venue activity, crowd movement and operational decisions',
      color: 'border-criticalRed/40 hover:border-criticalRed',
    },
  ];

  const FEATURES = [
    { icon: Navigation, label: 'Smart Routing', color: 'text-pitchGreen' },
    { icon: Languages, label: 'AI Translation', color: 'text-alertAmber' },
    { icon: Accessibility, label: 'Accessibility', color: 'text-indigo-400' },
    { icon: ShieldCheck, label: 'Verified Assistance', color: 'text-electricBlue' },
  ];

  return (
    <div className="min-h-screen bg-primaryDark text-slate-100 flex flex-col selection:bg-electricBlue selection:text-white">

      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <header className="px-6 py-3 flex justify-between items-center border-b border-slate-800 bg-stadiumNavy/20 sticky top-0 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2 select-none">
          <div className="bg-electricBlue text-white p-1.5 rounded-lg font-bold text-sm">🏟️</div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            StadiumPulse <span className="text-electricBlue">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-1.5 border border-slate-700 hover:border-slate-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            {t('Sign In')}
          </Link>
        </div>
      </header>

      {/* ── Hero (title + animated ball) ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Hero section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 pt-4">
          {/* Left side – text & CTAs */}
          <div className="flex-1 space-y-6">
            <span className="inline-block px-3 py-1 bg-blue-500/10 text-electricBlue border border-electricBlue/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
              StadiumPulse AI
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {t('Stadium')}<br />
              <span className="text-electricBlue">{t('Intelligence')}</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md font-medium">
              {t('Trusted AI assistance for fans, staff and venue operations. Verified-source guidance, crowd-aware navigation, multilingual assistance, and accessibility-first matchday support.')}
            </p>

            {/* Two compact CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('demo-selector');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-electricBlue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t('Explore Platform')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t('Sign In')}
              </button>
            </div>

            {/* Feature pill strip */}
            <div className="flex flex-wrap gap-2 pt-2">
              {FEATURES.map(({ icon: Icon, label, color }) => (
                <span key={label} className="flex items-center space-x-1.5 bg-stadiumNavy border border-slate-800 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-300">
                  <Icon size={12} className={color} />
                  <span>{t(label)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right side – animated soccer ball visual */}
          <div className="flex-shrink-0 flex items-center justify-center md:pr-6" aria-hidden="true">
            <div className="ball-scene-container">
              {/* Electric blue glow */}
              <div className="ball-glow" aria-hidden="true" />

              {/* Faint orbit rings */}
              <div className="orbit-ring-container" aria-hidden="true">
                <div className="orbit-ring-1" />
                <div className="orbit-ring-2" />
              </div>

              {/* Faint route path with two location markers */}
              <div className="route-path-container" aria-hidden="true">
                <svg className="route-svg" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                  {/* Dashed route line */}
                  <path d="M 40,200 Q 140,50 240,200" fill="none" className="route-line" />
                  {/* Location markers */}
                  <circle cx="40" cy="200" className="route-marker" />
                  <circle cx="240" cy="200" className="route-marker-alt" />
                </svg>
              </div>

              {/* Floating and rotating soccer ball */}
              <div className="ball-wrapper-anim">
                <img
                  src={soccerBall}
                  alt=""
                  className="soccer-ball-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Demo role selector ───────────────────────────────────────────── */}
        <div id="demo-selector" className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {t('Choose your matchday experience')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_ROLES.map(({ role, emoji, label, desc, color }) => (
              <button
                key={role}
                onClick={() => handleDemoMode(role)}
                className={`p-5 rounded-2xl bg-stadiumNavy border ${color} text-left flex flex-col space-y-2 transition-all hover:scale-[1.02] shadow-lg group cursor-pointer`}
              >
                <span className="text-2xl">{emoji}</span>
                <h3 className="font-extrabold text-white text-base group-hover:text-electricBlue transition-colors">
                  {t(label)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{t(desc)}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-semibold border-t border-slate-800 pt-4">
            <ShieldCheck size={12} className="text-pitchGreen" />
            <span>{t('Crowd-aware navigation')}</span>
            <span>·</span>
            <span>{t('Multilingual AI support')}</span>
            <span>·</span>
            <span>{t('Verified-source guidance')}</span>
          </div>
        </div>

      </main>

      <footer className="px-6 py-4 border-t border-slate-800 text-center text-[10px] text-slate-600 bg-stadiumNavy/10">
        {t('© FIFA World Cup 2026 Operations.')}
      </footer>

    </div>
  );
}
