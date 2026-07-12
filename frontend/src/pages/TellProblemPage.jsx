import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import { 
  Mic, 
  MicOff, 
  Languages, 
  Trash2, 
  Check, 
  AlertCircle,
  HelpCircle,
  FileText,
  Volume2,
  ShieldAlert,
  Loader2,
  Send,
  Sliders,
  Settings,
  ArrowRight
} from 'lucide-react';

export default function TellProblemPage() {
  const { user } = useAuth();
  const { stopSpeaking } = useAccessibility();
  const { t } = useTranslation();

  const userRole = user?.role || 'fan'; // fan, volunteer, staff, organizer

  // Accessibility/speech settings
  const [inputLang, setInputLang] = useState('Spanish');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // AI analysis results (extracted details)
  const [analysis, setAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef(null);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      const langMap = {
        English: 'en-US',
        Spanish: 'es-ES',
        French: 'fr-FR',
        German: 'de-DE',
        Hindi: 'hi-IN',
        Telugu: 'te-IN'
      };
      rec.lang = langMap[inputLang] || 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
        setSuccessMessage('');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? prev + ' ' + transcript : transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please enable mic permissions in your browser.');
        } else {
          setErrorMessage(`Voice input error: ${e.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [inputLang]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Speech-to-Text is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      setSuccessMessage('');
      recognitionRef.current.start();
    }
  };

  const handleProcessQuery = async () => {
    if (!inputText.trim()) {
      alert('Please enter or speak an issue first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setAnalysis(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await axios.post(`${backendUrl}/api/ai/process-query`, {
        text: inputText,
        inputLang: inputLang,
        role: userRole
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        timeout: 10000
      });

      if (response.data?.success && response.data?.analysis) {
        setAnalysis(response.data.analysis);
      } else {
        throw new Error('Invalid analysis payload');
      }
    } catch (err) {
      console.error('Processing failed:', err.message);
      setErrorMessage('AI processing failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, val) => {
    setAnalysis(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSubmitToOperations = async () => {
    if (!analysis) return;

    setSubmitting(true);
    setErrorMessage('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      if (userRole === 'fan') {
        // Submit Fan Complaint
        await axios.post(`${backendUrl}/api/reports/fan`, {
          text: analysis.englishTranslation || inputText,
          category: analysis.category || 'other',
          urgency: analysis.urgency || 'medium',
          location: analysis.location || 'General'
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setSuccessMessage('Your complaint has been logged and dispatched to stadium operations.');
      } else if (userRole === 'volunteer' || userRole === 'staff') {
        // Submit Staff Update
        await axios.post(`${backendUrl}/api/reports`, {
          text: analysis.details || analysis.englishTranslation || inputText,
          category: analysis.category || 'other',
          severity: analysis.severity || 'info',
          location: analysis.location || 'General'
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setSuccessMessage('Field status update registered in the operational incident register.');
      } else if (userRole === 'organizer') {
        // Broadcast Organizer Alert Directly
        await axios.post(`${backendUrl}/api/alerts`, {
          type: analysis.category || 'other',
          severity: analysis.severity || 'info',
          message: analysis.actionableInstruction || analysis.englishTranslation || inputText,
          target: analysis.locationAffected || analysis.location || 'General'
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setSuccessMessage('Critical operations warning published and broadcast to all matchday interfaces.');
      }

      // Clear input on success
      setInputText('');
      setAnalysis(null);
    } catch (err) {
      console.error('Failed to submit ticket:', err.message);
      setErrorMessage('Failed to log report in database operations. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpeakTranslation = (text) => {
    if (!text) return;
    stopSpeaking();
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get accent styles for role
  const getRoleAccentClass = () => {
    if (userRole === 'organizer') return 'accent-safety border-red-500/20';
    if (userRole === 'volunteer' || userRole === 'staff') return 'accent-ai border-purple-500/20';
    return 'accent-accessibility border-teal-500/20';
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto text-slate-100 px-0">
      {/* Dynamic Header based on Role */}
      <div className="flex flex-col space-y-1.5">
        <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit font-mono">
          FIFA Matchday · {userRole.toUpperCase()} PORTAL
        </span>
        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
          {userRole === 'fan' && 'Fan Complaint & Incident Portal'}
          {(userRole === 'volunteer' || userRole === 'staff') && 'Staff Field Update Portal'}
          {userRole === 'organizer' && 'Organizer Command & Broadcast'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium hidden sm:block">
          {userRole === 'fan' && 'Report issues, safety hazards, or ticketing problems via voice or text.'}
          {(userRole === 'volunteer' || userRole === 'staff') && 'Register congestion, gate alerts, or facility breakdowns via voice commands.'}
          {userRole === 'organizer' && 'Broadcast critical alerts in any language — AI extracts clean actionable directives.'}
        </p>
      </div>

      {/* Main Form Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        
        {/* Left Card: Input Panel */}
        <div className={`operations-card ${getRoleAccentClass()} p-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              {t('Voice / Text Dictation')}
            </h2>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono">Live Link</span>
            </div>
          </div>

          {/* Languages selection */}
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">{t('Speaking/Writing In')}</label>
            <select
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              className="bg-stadiumNavy border border-slate-700/60 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none cursor-pointer font-bold transition-all focus:border-cyan-400"
            >
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Voice Input Alerts */}
          {errorMessage && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-medium animate-fadeIn">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-400 font-medium animate-fadeIn">
              <Check size={14} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Text Area Input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                userRole === 'fan' 
                  ? t("Type or dictate: e.g. 'restroom R2 on Section 214 has no water'...") 
                  : userRole === 'organizer' 
                  ? t("Type or dictate: e.g. 'Broadcast to Gate B fans to enter via Gate D due to queues'...")
                  : t("Type or dictate: e.g. 'Gate B queue is 30 minutes. Direct volunteers to assist'...")
              }
              className="w-full h-40 bg-black/20 border border-slate-700/70 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400/80 outline-none font-medium resize-none transition-all"
            />
            {isListening && (
              <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">REC</span>
              </div>
            )}
          </div>

          {/* Mic Button & Actions */}
          <div className="flex justify-between items-center pt-1">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                  isListening 
                    ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg' 
                    : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
                title={isListening ? t('Stop Recording') : t('Speak in selected language')}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="button"
                onClick={() => { setInputText(''); setAnalysis(null); }}
                className="p-3 rounded-xl bg-stadiumNavy border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center cursor-pointer transition-all"
                title={t('Clear Text')}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <button
              onClick={handleProcessQuery}
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow-md transition-all font-mono"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sliders size={14} />
                  <span>Analyze Intel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Card: AI Structured Analysis */}
        <div className="space-y-4">
          {!analysis ? (
            <div className="operations-card border-slate-800/40 p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                <Settings size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">Awaiting Operations Intel</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-sans">
                  Enter text or use speech dictation on the left, then trigger analysis to extract details.
                </p>
              </div>
            </div>
          ) : (
            <div className={`operations-card ${getRoleAccentClass()} p-6 space-y-5 min-h-[360px] flex flex-col justify-between`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                    <Check size={14} className="text-green-400" />
                    <span>AI Operations Extraction Log</span>
                  </h3>
                  <button
                    onClick={() => handleSpeakTranslation(analysis.englishTranslation)}
                    className="p-1 rounded bg-stadiumNavy hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={t('Speak Translation')}
                  >
                    <Volume2 size={13} />
                  </button>
                </div>

                {/* English Translation View */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider font-mono">English Translation</span>
                  <div className="p-3 bg-black/25 border border-slate-800/70 rounded-xl text-xs text-slate-300 font-medium leading-relaxed font-sans">
                    {analysis.englishTranslation}
                  </div>
                </div>

                {/* Role Specific Structured Form Fields */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Category Field */}
                  {userRole !== 'organizer' && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Category</span>
                      <select
                        value={analysis.category || 'other'}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        className="bg-stadiumNavy border border-slate-800/80 rounded-xl text-xs py-1.5 px-2 text-slate-300 outline-none font-bold focus:border-cyan-400"
                      >
                        {['facilities', 'crowd', 'safety', 'medical', 'accessibility', 'other'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Location Field */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Location</span>
                    <input
                      type="text"
                      value={analysis.location || analysis.locationAffected || 'General'}
                      onChange={(e) => handleFieldChange(userRole === 'organizer' ? 'locationAffected' : 'location', e.target.value)}
                      className="bg-stadiumNavy border border-slate-800/80 rounded-xl text-xs py-1.5 px-2.5 text-slate-300 outline-none font-bold focus:border-cyan-400"
                    />
                  </div>

                  {/* Urgency Level (Fan Only) */}
                  {userRole === 'fan' && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Urgency</span>
                      <select
                        value={analysis.urgency || 'medium'}
                        onChange={(e) => handleFieldChange('urgency', e.target.value)}
                        className="bg-stadiumNavy border border-slate-800/80 rounded-xl text-xs py-1.5 px-2 text-slate-300 outline-none font-bold focus:border-cyan-400"
                      >
                        {['low', 'medium', 'high'].map(urg => (
                          <option key={urg} value={urg}>{urg}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Severity Level (Staff/Organizer Only) */}
                  {userRole !== 'fan' && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Severity</span>
                      <select
                        value={analysis.severity || 'info'}
                        onChange={(e) => handleFieldChange('severity', e.target.value)}
                        className="bg-stadiumNavy border border-slate-800/80 rounded-xl text-xs py-1.5 px-2 text-slate-300 outline-none font-bold focus:border-cyan-400"
                      >
                        {['info', 'warning', 'critical'].map(sev => (
                          <option key={sev} value={sev}>{sev}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Target Audience (Organizer Only) */}
                  {userRole === 'organizer' && (
                    <div className="flex flex-col space-y-1 col-span-2">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Target Audience</span>
                      <input
                        type="text"
                        value={analysis.targetAudience || 'all fans'}
                        onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                        className="bg-stadiumNavy border border-slate-800/80 rounded-xl text-xs py-1.5 px-2.5 text-slate-300 outline-none font-bold focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Edit Actionable Details or Description */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">
                    {userRole === 'organizer' ? 'Actionable Broadcast Alert' : 'Cleaned English Details'}
                  </span>
                  <textarea
                    value={analysis.actionableInstruction || analysis.details || analysis.cleanedDescription || ''}
                    onChange={(e) => handleFieldChange(
                      userRole === 'organizer' ? 'actionableInstruction' : userRole === 'volunteer' || userRole === 'staff' ? 'details' : 'cleanedDescription', 
                      e.target.value
                    )}
                    className="w-full h-18 bg-stadiumNavy border border-slate-800/85 rounded-xl p-2 text-xs text-slate-300 outline-none font-semibold resize-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Commit Button */}
              <button
                onClick={handleSubmitToOperations}
                disabled={submitting}
                className="w-full mt-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-lg transition-all font-mono"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Transmitting details...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>
                      {userRole === 'fan' && 'Submit Complaint & Dispatch Supervisor'}
                      {(userRole === 'volunteer' || userRole === 'staff') && 'Log Incident Report & Dispatch'}
                      {userRole === 'organizer' && 'Broadcast Operational Alert Immediately'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
