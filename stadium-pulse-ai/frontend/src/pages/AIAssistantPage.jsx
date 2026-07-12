import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTranslation } from '../utils/useTranslation';
import AIMessage from '../components/AIMessage';
import { 
  Send, 
  Mic, 
  MicOff, 
  Loader2,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function AIAssistantPage() {
  const { language, setLanguage, speakText, stopSpeaking } = useAccessibility();
  const { t } = useTranslation();

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Answer: Hello! I am StadiumPulse AI, your verified assistant for the FIFA World Cup 2026.
Source: Stadium Operations Center
Reason: Grounded in active stadium gate databases and real-time crowd metrics.
Action: Ask me a question about gate locations, accessible restrooms, or exiting routes.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API Speech Recognition
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
      rec.lang = langMap[language] || 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition (Speech-to-Text) is not supported in this browser. Please try in Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    stopSpeaking(); // Stop any ongoing speech when user submits a new query

    // Append user message
    const userMsgId = `user_${Date.now()}`;
    const userMsg = { id: userMsgId, sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('stadiumpulse_user') 
        ? JSON.parse(localStorage.getItem('stadiumpulse_user')).token 
        : '';

      const response = await axios.post(`${backendUrl}/api/ai/ask`, {
        question: queryText,
        language: language,
        stadiumId: 'stadium_pulse_arena_2026'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-demo-role': 'fan'
        }
      });

      if (response.data.success) {
        const botResponseText = response.data.response;
        setMessages(prev => [...prev, {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: botResponseText
        }]);
        speakText(botResponseText);
      }
    } catch (error) {
      console.error('Q&A error:', error.message);
      setMessages(prev => [...prev, {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: `Answer: I don’t have verified information for that right now.
Source: Local Gateway Timeout
Reason: Connection to the StadiumPulse AI query backend is unavailable.
Action: Please check if the local backend server is running on port 5000.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSend(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Answer: Chat history cleared. What verified information can I assist you with today?
Source: Stadium Intelligence Core
Reason: Security context reset.
Action: Select a suggested query below or type your question.`
      }
    ]);
  };

  const suggestedQuestions = [
    "Where is Gate B located?",
    "What is the least crowded route to Section 214?",
    "Where is the nearest accessible restroom?",
    "How do I reach the Metro Exit 3 Transit Hub?",
    "What should I do if my gate is crowded?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] max-w-4xl mx-auto border border-slate-800 rounded-3xl overflow-hidden glass-panel">
      
      {/* Assistant Header */}
      <div className="p-4 bg-stadiumNavy/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-electricBlue/20 text-electricBlue border border-electricBlue/30 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">{t('StadiumPulse Assistant')}</h2>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-pitchGreen">{t('Grounded RAG Bot')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-stadiumNavy border border-slate-700 rounded-lg text-xs py-1.5 px-2 text-slate-300 outline-none"
            title="Chat translation language"
          >
            {['English', 'Spanish', 'French', 'German', 'Hindi', 'Telugu'].map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          {/* Reset chat */}
          <button 
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
            title="Clear Chat History"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
        {messages.map((message) => (
          <AIMessage key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex space-x-3 max-w-[70%] items-center text-xs text-slate-400 py-2 font-medium">
            <Loader2 size={16} className="animate-spin text-electricBlue" />
            <span>{t('Consulting verified stadium logs...')}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions Drawer */}
      <div className="p-3 bg-stadiumNavy/20 border-t border-slate-800/80 space-y-1.5">
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">{t('Suggested Verified Queries')}</span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedQuestion(q)}
              disabled={loading}
              className="text-[10px] md:text-xs font-semibold px-2.5 py-1.5 bg-stadiumNavy/60 hover:bg-electricBlue border border-slate-800 hover:border-electricBlue rounded-lg text-slate-300 hover:text-white transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-800 bg-stadiumNavy/40 flex items-center space-x-2"
      >
        <button
          type="button"
          onClick={handleMicToggle}
          className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-criticalRed border-criticalRed text-white animate-pulse' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Speech-to-Text Voice Input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          placeholder={isListening ? t('Listening... Speak clearly') : t(`Ask StadiumPulse AI in ${language}...`)}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || isListening}
          className="flex-1 bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-electricBlue outline-none font-medium"
        />

        <button
          type="submit"
          disabled={loading || !input.trim() || isListening}
          className="p-3 rounded-xl bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-all font-bold"
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
}
