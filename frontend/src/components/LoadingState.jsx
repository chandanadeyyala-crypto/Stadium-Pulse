import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '../utils/useTranslation';

export default function LoadingState({ message }) {
  const { t: translate } = useTranslation();

  const defaultMessages = [
    translate('🏟️ Loading venue information...'),
    translate('🚦 Checking operational updates...'),
    translate('🗺️ Preparing navigation...'),
    translate('🍔 Finding nearby food services...'),
    translate('🤖 Initializing AI Assistant...'),
    translate('♿ Loading accessibility settings...'),
    translate('🚨 Retrieving alerts...')
  ];

  const messages = message ? [message] : defaultMessages;
  const [index, setIndex] = useState(0);
  const [showTimeoutText, setShowTimeoutText] = useState(false);

  useEffect(() => {
    if (messages.length <= 1) return;

    // Rotate every 1.5 seconds
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    // Timeout of 5 seconds
    const timeout = setTimeout(() => {
      setShowTimeoutText(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3.5 text-center">
      <div className="relative flex items-center justify-center">
        <Loader2 size={36} className="text-electricBlue animate-spin" />
        <div className="absolute inset-0 rounded-full border border-electricBlue/10 animate-ping" />
      </div>
      <div className="space-y-1">
        <p className="text-xs md:text-sm text-slate-300 font-semibold tracking-wide animate-pulse">
          {messages[index]}
        </p>
        {showTimeoutText && (
          <p className="text-[11px] text-amber-400 font-medium animate-fade-in">
            ⚠️ {translate('Still connecting to venue services...')}
          </p>
        )}
      </div>
    </div>
  );
}
