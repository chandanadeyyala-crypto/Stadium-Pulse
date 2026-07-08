import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Volume2, 
  VolumeX, 
  Languages, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import axios from 'axios';

export default function AlertCard({ alert, onTranslate }) {
  const { speakText, stopSpeaking, speechEnabled } = useAccessibility();
  const [translatedText, setTranslatedText] = useState('');
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [speaking, setSpeaking] = useState(false);
  const navigate = useNavigate();

  const handleSpeech = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speakText(translatedText || alert.message);
      setSpeaking(true);
      // Automatically reset state after 10s
      setTimeout(() => setSpeaking(false), 10000);
    }
  };

  const handleTranslate = async (langCode, langName) => {
    if (langCode === 'en') {
      setTranslatedText('');
      setCurrentLang('en');
      return;
    }

    setLoadingTranslation(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('stadiumpulse_user') 
        ? JSON.parse(localStorage.getItem('stadiumpulse_user')).token 
        : '';

      const response = await axios.post(`${backendUrl}/api/ai/translate`, {
        text: alert.message,
        targetLang: langName
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-demo-role': 'fan'
        }
      });

      if (response.data.success) {
        setTranslatedText(response.data.translatedText);
        setCurrentLang(langCode);
      }
    } catch (err) {
      console.error('Translation failed:', err.message);
      setTranslatedText(`[Translation Error] ${alert.message}`);
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleShowRoute = () => {
    if (alert.target) {
      // Pass destination node ID to smart navigation page state
      navigate('/smart-navigation', { state: { destinationNode: alert.target } });
    }
  };

  const timeAgo = (dateStr) => {
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (minutes <= 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className={`p-4 rounded-xl border glass-panel transition-all ${
      alert.severity === 'critical' 
        ? 'border-red-500/30 bg-red-950/10' 
        : alert.severity === 'warning'
        ? 'border-amber-500/20 bg-amber-950/5'
        : 'border-slate-800'
    }`}>
      {/* Alert Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <StatusBadge status={alert.severity} text={alert.severity === 'info' ? 'Update' : alert.severity.toUpperCase()} />
          <span className="text-[10px] text-slate-500 font-medium">
            {timeAgo(alert.timestamp)}
          </span>
        </div>
        {alert.type && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {alert.type}
          </span>
        )}
      </div>

      {/* Message Body */}
      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-3">
        {translatedText || alert.message}
      </p>

      {/* Target Node Tag */}
      {alert.target && (
        <div className="flex items-center space-x-1 text-xs text-electricBlue font-semibold mb-3">
          <MapPin size={12} />
          <span>Affecting: {alert.target}</span>
        </div>
      )}

      {/* Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
        {/* Translation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleTranslate('en')}
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${currentLang === 'en' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            EN
          </button>
          <button
            onClick={() => handleTranslate('es', 'Spanish')}
            disabled={loadingTranslation}
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${currentLang === 'es' ? 'bg-electricBlue text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ES
          </button>
          <button
            onClick={() => handleTranslate('fr', 'French')}
            disabled={loadingTranslation}
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${currentLang === 'fr' ? 'bg-electricBlue text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            FR
          </button>
          {loadingTranslation && <Loader2 size={10} className="animate-spin text-slate-400 ml-1" />}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* TTS Button */}
          <button
            onClick={handleSpeech}
            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 font-medium transition-all ${speaking ? 'bg-pitchGreen border-pitchGreen text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
            title="Read Alert Out Loud"
          >
            {speaking ? <Volume2 size={14} className="animate-bounce" /> : <Volume2 size={14} />}
            <span className="hidden sm:inline">Hear</span>
          </button>

          {/* Show Route Button */}
          {alert.target && (
            <button
              onClick={handleShowRoute}
              className="px-2.5 py-1.5 bg-electricBlue hover:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
            >
              <span>Show Route</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
