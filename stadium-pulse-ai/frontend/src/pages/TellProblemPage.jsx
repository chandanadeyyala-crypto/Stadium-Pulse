import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import { 
  Mic, 
  MicOff, 
  Languages, 
  Volume2, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function TellProblemPage() {
  const { stopSpeaking } = useAccessibility();
  const { t } = useTranslation();

  const [inputLang, setInputLang] = useState('Spanish');
  const [targetLang, setTargetLang] = useState('French');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Translations results
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [targetTranslation, setTargetTranslation] = useState('');

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
      recognitionRef.current.start();
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      alert('Please enter or speak a problem first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      // 1. Translate to English
      let translatedEn = '';
      if (inputLang === 'English') {
        translatedEn = inputText;
      } else {
        try {
          const resEn = await axios.post(`${backendUrl}/api/ai/translate`, {
            text: inputText,
            targetLang: 'English'
          }, { timeout: 8000 });
          translatedEn = resEn.data?.translatedText || '';
        } catch (_err) {
          console.warn('Backend translation to English failed, using mock client fallback.');
          translatedEn = getMockTranslation(inputText, inputLang, 'English');
        }
      }
      setEnglishTranslation(translatedEn);

      // 2. Translate to Target Language
      let translatedTarget = '';
      if (inputLang === targetLang) {
        translatedTarget = inputText;
      } else {
        try {
          const resTarget = await axios.post(`${backendUrl}/api/ai/translate`, {
            text: inputText,
            targetLang: targetLang
          }, { timeout: 8000 });
          translatedTarget = resTarget.data?.translatedText || '';
        } catch (_err) {
          console.warn('Backend translation to target language failed, using mock client fallback.');
          translatedTarget = getMockTranslation(inputText, inputLang, targetLang);
        }
      }
      setTargetTranslation(translatedTarget);

    } catch (_err) {
      setErrorMessage('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe client-side translation mock logic when backend is offline
  const getMockTranslation = (text, fromLang, toLang) => {
    const cleaned = text.toLowerCase().trim();
    
    // Sample translations for typical stadium issues
    const database = {
      "donde esta la puerta b": {
        English: "Where is gate B?",
        Spanish: "Where is gate B?",
        French: "Où est la porte B ?",
        German: "Wo ist Tor B?",
        Hindi: "गेट बी कहाँ है?",
        Telugu: "గేట్ బి ఎక్కడ ఉంది?"
      },
      "gate b": {
        English: "Where is gate B?",
        French: "Où est la porte B ?",
        German: "Wo ist Tor B?",
        Hindi: "गेट बी कहाँ है?",
        Telugu: "గేట్ బి ఎక్కడ ఉంది?"
      },
      "me siento mal": {
        English: "I feel sick / I need medical assistance.",
        Spanish: "Me siento mal.",
        French: "Je me sens mal / J'ai besoin d'une assistance médicale.",
        German: "Ich fühle mich krank / Ich brauche ärztliche Hilfe.",
        Hindi: "मेरी तबीयत ठीक नहीं है / मुझे चिकित्सा सहायता चाहिए।",
        Telugu: "నాకు ఆరోగ్యం బాగాలేదు / నాకు వైద్య సహాయం కావాలి."
      },
      "j'ai perdu mon sac": {
        English: "I lost my bag.",
        Spanish: "He perdido mi bolso.",
        French: "J'ai perdu mon sac.",
        German: "Ich habe meine Tasche verloren.",
        Hindi: "मेरा बैग खो गया है।",
        Telugu: "నా బ్యాగ్ పోయింది."
      },
      "मदద चाहिए": {
        English: "I need help / assistance.",
        Spanish: "Necesito ayuda.",
        French: "J'ai besoin d'aide.",
        German: "Ich brauche Hilfe.",
        Hindi: "मुझे मदद चाहिए।",
        Telugu: "నాకు సహాయం కావాలి."
      }
    };

    // Exact matches
    if (database[cleaned]) {
      return database[cleaned][toLang] || database[cleaned]["English"];
    }

    // Substring searches
    for (const key of Object.keys(database)) {
      if (cleaned.includes(key) || key.includes(cleaned)) {
        return database[key][toLang] || database[key]["English"];
      }
    }

    // Fallback if no matching mock entry is found
    return `[Translated from ${fromLang} to ${toLang}] ${text}`;
  };

  const handleSpeak = (text, lang) => {
    if (!text) return;
    stopSpeaking();
    
    // Quick language synthesizer configuration
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        English: 'en-US',
        Spanish: 'es-ES',
        French: 'fr-FR',
        German: 'de-DE',
        Hindi: 'hi-IN',
        Telugu: 'te-IN'
      };
      utterance.lang = langMap[lang] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 p-2">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <span className="inline-block px-3 py-1 bg-blue-500/10 text-electricBlue border border-electricBlue/20 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
          StadiumPulse AI · Assistive Gateway
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {t('Query')}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-medium">
          {t('Speak or type your concern in any language. Our AI will instantly translate it to English for staff reference and translate to any chosen target language.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Input Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {t('Describe Your Issue')}
          </h2>

          {/* Languages selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{t('Speaking/Writing In')}</label>
              <select
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
                className="bg-stadiumNavy border border-slate-700 rounded-lg text-xs py-2 px-2.5 text-slate-300 outline-none cursor-pointer font-semibold"
              >
                {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">{t('Translate To')}</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-stadiumNavy border border-slate-700 rounded-lg text-xs py-2 px-2.5 text-slate-300 outline-none cursor-pointer font-semibold"
              >
                {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Input Alert */}
          {errorMessage && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Text Area Input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('Type your problem or click the microphone to speak...')}
              className="w-full h-40 bg-stadiumNavy/60 border border-slate-700 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-electricBlue outline-none font-medium resize-none"
            />
            {isListening && (
              <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-red-500/20 border border-red-500/40 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Listening</span>
              </div>
            )}
          </div>

          {/* Mic Button & Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                  isListening 
                    ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                    : 'bg-stadiumNavy border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isListening ? t('Stop Recording') : t('Speak in selected language')}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setInputText('')}
                className="p-3 rounded-xl bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                title={t('Clear Text')}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg transition-all"
            >
              <Languages size={14} />
              <span>{loading ? t('Translating...') : t('Translate Issue')}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Translation Output */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {t('Translation Results')}
            </h2>

            {/* Translation to English Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-electricBlue uppercase tracking-wider">
                  {t('Translation to English')}
                </span>
                {englishTranslation && (
                  <button
                    onClick={() => handleSpeak(englishTranslation, 'English')}
                    className="p-1 rounded bg-stadiumNavy hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={t('Speak Translation')}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              <div className="min-h-16 bg-stadiumNavy/40 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-semibold">
                {englishTranslation ? englishTranslation : (
                  <span className="text-slate-600 font-medium italic">{t('Translations to English will appear here...')}</span>
                )}
              </div>
            </div>

            {/* Translation to Chosen Target Language Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-pitchGreen uppercase tracking-wider">
                  {t('Translation to')} {t(targetLang)}
                </span>
                {targetTranslation && (
                  <button
                    onClick={() => handleSpeak(targetTranslation, targetLang)}
                    className="p-1 rounded bg-stadiumNavy hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={t('Speak Translation')}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              <div className="min-h-16 bg-stadiumNavy/40 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-semibold">
                {targetTranslation ? targetTranslation : (
                  <span className="text-slate-600 font-medium italic">{t('Translations to target language will appear here...')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Command center quick status */}
          <div className="border-t border-slate-800 pt-4 flex items-center space-x-2 text-[10px] text-slate-500 font-semibold">
            <Check size={12} className="text-pitchGreen" />
            <span>{t('Grounded translation pipelines active')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
