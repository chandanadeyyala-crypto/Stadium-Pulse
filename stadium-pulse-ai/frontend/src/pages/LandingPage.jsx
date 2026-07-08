import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import { useAuth } from '../context/AuthContext';
import { 
  Navigation, 
  Languages, 
  AlertTriangle, 
  Accessibility, 
  Brain, 
  ShieldAlert 
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInAsDemoRole } = useAuth();

  const handleDemoMode = (role) => {
    signInAsDemoRole(role);
    if (['volunteer', 'staff', 'organizer'].includes(role)) {
      navigate('/staff-dashboard');
    } else {
      navigate('/fan-home');
    }
  };

  return (
    <div className="min-h-screen bg-primaryDark text-slate-100 flex flex-col justify-between selection:bg-electricBlue selection:text-white">
      {/* Landing Navbar */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-stadiumNavy/20 sticky top-0 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-electricBlue text-white p-2 rounded-lg font-bold">🏟️</div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            StadiumPulse <span className="text-electricBlue">AI</span>
          </span>
        </div>
        <Link 
          to="/login"
          className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-xl text-sm font-semibold transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-6 max-w-3xl">
          {/* Tagline Badge */}
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-500/10 text-electricBlue border border-electricBlue/20 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <span>FIFA World Cup 2026 Operations Prototype</span>
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Real-time stadium intelligence grounded in <span className="text-electricBlue">verified facts.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            AI-powered indoor navigation, multilingual assistant chat, and staff command decisions — utilizing strict anti-hallucination guardrails to keep matchday safe, smooth, and accessible.
          </p>
        </div>

        {/* Call to Actions / Demo Role Selectors */}
        <div className="w-full max-w-4xl glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white">Select a Demo Role to Test the Platform</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fan Card */}
            <button 
              onClick={() => handleDemoMode('fan')}
              className="p-5 rounded-2xl bg-stadiumNavy border border-slate-700 hover:border-electricBlue text-left flex flex-col space-y-2 transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="text-2xl text-pitchGreen">🎫</div>
              <h3 className="font-extrabold text-white text-lg group-hover:text-electricBlue transition-colors">Continue as Fan</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">View ticket details, query AI, get crowd-aware routes, and manage accessibility options.</p>
            </button>

            {/* Staff Card */}
            <button 
              onClick={() => handleDemoMode('staff')}
              className="p-5 rounded-2xl bg-stadiumNavy border border-slate-700 hover:border-electricBlue text-left flex flex-col space-y-2 transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="text-2xl text-alertAmber">🛡️</div>
              <h3 className="font-extrabold text-white text-lg group-hover:text-electricBlue transition-colors">Staff Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Report incidents in any language, verify AI drafts, and manage volunteer tasks.</p>
            </button>

            {/* Organizer Card */}
            <button 
              onClick={() => handleDemoMode('organizer')}
              className="p-5 rounded-2xl bg-stadiumNavy border border-slate-700 hover:border-electricBlue text-left flex flex-col space-y-2 transition-all hover:scale-[1.02] shadow-lg group"
            >
              <div className="text-2xl text-criticalRed">⚡</div>
              <h3 className="font-extrabold text-white text-lg group-hover:text-electricBlue transition-colors">Command Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">View full venue crowd maps, approve urgent alert broadcasts, and inspect operational integrity.</p>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-semibold border-t border-slate-800 pt-4">
            <span className="flex items-center space-x-1">
              <ShieldAlert size={14} className="text-pitchGreen" />
              <span>Anti-Hallucination Active</span>
            </span>
            <span>•</span>
            <span>Leaflet + OpenStreetMap maps</span>
            <span>•</span>
            <span>Gemini Flash & Groq pipeline</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Features Built for FIFA Matchday</h2>
            <p className="text-xs md:text-sm text-slate-400 font-medium">Click and test each module inside the platform dashboards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <FeatureCard 
              title="Smart Venue Routing" 
              description="Calculate directions inside the stadium. Switch preferences between Fastest, Least Congested, or Wheelchair/Stroller accessible paths."
              icon={Navigation}
              colorClass="text-pitchGreen"
            />
            <FeatureCard 
              title="AI Assistant grounding" 
              description="Queries are RAG-grounded. The assistant strictly answers from verified infrastructure records and logs, preventing fake directions."
              icon={Brain}
              colorClass="text-electricBlue"
            />
            <FeatureCard 
              title="Instant Alert Translation" 
              description="Broadcaster translates alert messages to any fan preference in real-time. Translates staff incident notes automatically."
              icon={Languages}
              colorClass="text-alertAmber"
            />
            <FeatureCard 
              title="Access Center" 
              description="Customize user scaling, toggle high-contrast display, toggle Speech Synthesis (TTS), and find closest elevators or medical stands."
              icon={Accessibility}
              colorClass="text-indigo-400"
            />
            <FeatureCard 
              title="SOS Emergency Assistance" 
              description="One-click emergency broadcast trigger that maps your GPS coordinates and section layout to command center staff instantly."
              icon={ShieldAlert}
              colorClass="text-criticalRed"
            />
            <FeatureCard 
              title="Alert Approvals Workflow" 
              description="Staff reports incidents in any dialect; AI extracts details, drafts fan updates, and holds for organizer review before publishing."
              icon={AlertTriangle}
              colorClass="text-teal-400"
            />
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="px-6 py-6 border-t border-slate-800 text-center text-xs text-slate-500 bg-stadiumNavy/10 space-y-2">
        <p>© FIFA World Cup 2026 Operations Assistance System. All rights reserved.</p>
        <p className="font-mono">Status: Sandbox Mock Mode · Powered by Google Gemini</p>
      </footer>
    </div>
  );
}
