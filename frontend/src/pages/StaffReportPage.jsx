import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import StatusBadge from '../components/StatusBadge';
import { 
  FileText, 
  Mic, 
  MicOff, 
  MapPin, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  Sparkles,
  Send
} from 'lucide-react';

const CATEGORIES = ['Crowd', 'Medical', 'Security', 'Lost Item/Person', 'Accessibility Issue', 'Transport Delay', 'Gate Closure', 'Facility Issue'];
const SEVERITIES = ['info', 'warning', 'critical'];
const LOCATIONS = ['Gate A', 'Gate B', 'Gate D', 'Concourse East', 'Concourse West', 'Section 214', 'Restroom R2', 'Medical Desk', 'Metro Exit 3'];

export default function StaffReportPage() {
  const { user } = useAuth();
  const { language } = useAccessibility();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    text: '',
    category: 'Crowd',
    severity: 'warning',
    location: 'Gate B'
  });

  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  // Setup SpeechRecognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setFormData(prev => ({ ...prev, text: prev.text + ' ' + transcript }));
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleGeneratePreview = async () => {
    if (!formData.text.trim()) {
      setError('Please enter incident details before generating a preview.');
      return;
    }
    setError('');
    setGeneratingPreview(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = JSON.parse(localStorage.getItem('stadiumpulse_user') || '{}').token || '';
      const res = await axios.post(`${backendUrl}/api/reports`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-demo-role': user?.role || 'staff' }
      });
      if (res.data.success) {
        setAiPreview(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Preview generation failed. Check backend connection.');
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleApproveAndSubmit = async () => {
    if (!aiPreview) return;
    setSubmitting(true);
    // The report is already saved on generate. We just need to navigate to approval.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => navigate('/alert-approval'), 2000);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <CheckCircle size={56} className="text-pitchGreen animate-bounce" />
        <h2 className="text-xl font-extrabold text-white">Report Submitted!</h2>
        <p className="text-sm text-slate-400 font-medium max-w-xs">AI has summarised and drafted a fan alert. Redirecting to Alert Approval dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <FileText className="text-alertAmber" />
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">File Incident Report</h1>
          <p className="text-[10px] uppercase font-semibold text-slate-400">Staff can type in any language — AI will translate &amp; summarise</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Form */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-5">
          {/* Incident Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Incident Description</label>
            <p className="text-[10px] text-slate-500 font-medium">Type in any language (Hindi, Telugu, Spanish, etc.) — AI will auto-translate.</p>
            <div className="relative">
              <textarea
                rows={5}
                placeholder="e.g., Gate B ke paas bahut bheed hai, log agey nahi badh pa rahe..."
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                className="w-full bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-electricBlue outline-none font-medium resize-none"
              />
              {/* Voice input button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${isListening ? 'bg-criticalRed border-criticalRed text-white animate-pulse' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
                title="Voice Input (STT)"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            </div>
            {isListening && (
              <p className="text-xs text-criticalRed font-bold animate-pulse flex items-center space-x-1">
                <span className="w-2 h-2 bg-criticalRed rounded-full animate-ping inline-block" />
                <span>Recording... Speak clearly</span>
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
              <MapPin size={11} /><span>Incident Location</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-stadiumNavy border border-slate-700 rounded-xl py-2 px-3 text-sm font-bold text-white outline-none"
            >
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.toLowerCase().split('/')[0].trim() }))}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${formData.category === cat.toLowerCase().split('/')[0].trim() ? 'bg-electricBlue/20 border-electricBlue text-white' : 'bg-stadiumNavy border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Severity Level</label>
            <div className="flex space-x-2">
              {SEVERITIES.map(sev => (
                <button
                  key={sev}
                  onClick={() => setFormData(prev => ({ ...prev, severity: sev }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${formData.severity === sev ? (sev === 'critical' ? 'bg-criticalRed/20 border-criticalRed text-criticalRed' : sev === 'warning' ? 'bg-alertAmber/20 border-alertAmber text-alertAmber' : 'bg-electricBlue/20 border-electricBlue text-electricBlue') : 'bg-stadiumNavy border-slate-800 text-slate-500'}`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-criticalRed rounded-lg flex items-center space-x-2">
              <AlertTriangle size={14} /><span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGeneratePreview}
            disabled={generatingPreview || !formData.text.trim()}
            className="w-full py-3 bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
          >
            {generatingPreview ? <><Loader2 size={16} className="animate-spin" /><span>AI Summarising...</span></> : <><Sparkles size={16} /><span>Generate AI Preview</span></>}
          </button>
        </div>

        {/* AI Preview Panel */}
        <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 space-y-5">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">AI Draft Preview</h3>
          </div>

          {!aiPreview ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-2xl">
              <Sparkles size={28} className="text-slate-700" />
              <p className="text-xs text-slate-500 font-medium max-w-xs">Fill out the form and click "Generate AI Preview" to see the AI-translated summary and fan alert draft.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">English Operations Summary</span>
                <p className="text-sm text-slate-200 bg-black/30 p-3 rounded-xl border border-slate-800 font-medium leading-relaxed">
                  {aiPreview.incident?.englishSummary}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-alertAmber">Draft Fan Alert (Pending Approval)</span>
                <p className="text-sm text-slate-200 bg-alertAmber/5 p-3 rounded-xl border border-alertAmber/20 font-medium leading-relaxed">
                  {aiPreview.incident?.draftFanAlert}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <StatusBadge status="pending_approval" text="Pending Approval" />
                <span className="text-[10px] text-slate-500 font-semibold">Alert will NOT broadcast until approved.</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl text-[10px] text-slate-500 border border-slate-800 font-mono leading-relaxed">
                AI Draft. Staff must approve before fan broadcast.<br/>
                Anti-hallucination: Only report details are used.
              </div>

              <button
                onClick={handleApproveAndSubmit}
                disabled={submitting}
                className="w-full py-3 bg-pitchGreen hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /><span>Submitting...</span></> : <><Send size={16} /><span>Submit for Approval</span></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
