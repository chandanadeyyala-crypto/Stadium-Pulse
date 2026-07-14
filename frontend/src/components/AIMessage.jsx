import React from 'react';
import SourceBadge from './SourceBadge';
import {
  Bot,
  User,
  Lightbulb,
  CheckCircle,
  AlertOctagon
} from 'lucide-react';

export default function AIMessage({ message }) {
  const isBot = message.sender === 'bot';
  const text = message.text || '';

  // Function to parse the structured AI response format:
  // Answer: ...
  // Source: ...
  // Reason: ...
  // Action: ...
  const parseStructuredResponse = (content) => {
    const parts = {
      answer: '',
      source: '',
      reason: '',
      action: ''
    };

    const answerIdx = content.indexOf('Answer:');
    const sourceIdx = content.indexOf('Source:');
    const reasonIdx = content.indexOf('Reason:');
    const actionIdx = content.indexOf('Action:');

    // If parsing headers are not found, return text as default answer
    if (answerIdx === -1 && sourceIdx === -1 && reasonIdx === -1 && actionIdx === -1) {
      parts.answer = content;
      return parts;
    }

    // Helper to slice text safely
    const getSlice = (startPos, nextPos) => {
      const start = startPos + 7; // Length of header like "Answer:"
      const end = nextPos === -1 ? content.length : nextPos;
      return content.substring(start, end).trim();
    };

    if (answerIdx !== -1) {
      const next = [sourceIdx, reasonIdx, actionIdx].filter(x => x > answerIdx).sort((a, b) => a - b)[0] || -1;
      parts.answer = getSlice(answerIdx, next);
    }
    if (sourceIdx !== -1) {
      const next = [answerIdx, reasonIdx, actionIdx].filter(x => x > sourceIdx).sort((a, b) => a - b)[0] || -1;
      parts.source = getSlice(sourceIdx, next);
    }
    if (reasonIdx !== -1) {
      const next = [answerIdx, sourceIdx, actionIdx].filter(x => x > reasonIdx).sort((a, b) => a - b)[0] || -1;
      parts.reason = getSlice(reasonIdx, next);
    }
    if (actionIdx !== -1) {
      const next = [answerIdx, sourceIdx, reasonIdx].filter(x => x > actionIdx).sort((a, b) => a - b)[0] || -1;
      parts.action = getSlice(actionIdx, next);
    }

    return parts;
  };

  const parsed = isBot ? parseStructuredResponse(text) : null;
  const isDataMissing = text.includes('I don’t have verified information') || (parsed && parsed.answer.includes('I don’t have verified information'));

  return (
    <div className={`flex space-x-3 max-w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
      {/* Icon Profile */}
      {isBot && (
        <div className="w-8 h-8 rounded-lg bg-electricBlue/20 text-electricBlue border border-electricBlue/40 flex items-center justify-center shrink-0">
          <Bot size={18} />
        </div>
      )}

      {/* Message Box */}
      <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] border shadow-md space-y-3 ${isBot
          ? isDataMissing
            ? 'bg-red-500/10 border-red-500/30 text-slate-200'
            : 'bg-stadiumNavy/75 border-slate-700/60 text-slate-200'
          : 'bg-electricBlue text-white border-electricBlue'
        }`}>
        {!isBot ? (
          /* User Message Text */
          <p className="text-sm font-semibold leading-relaxed">{text}</p>
        ) : (
          /* Bot Structured RAG Response */
          <div className="space-y-3">
            {/* 1. Missing Data Indicator Warning */}
            {isDataMissing && (
              <div className="bg-red-500/20 border border-red-500/40 p-2.5 rounded-lg text-xs text-criticalRed font-bold flex items-center space-x-2">
                <AlertOctagon size={16} className="shrink-0 animate-bounce" />
                <span>Verified Assistance Guard: Missing Grounding Data</span>
              </div>
            )}

            {/* 2. Answer Text */}
            <div className="space-y-1">
              {parsed.answer && (
                <p className="text-sm font-medium leading-relaxed">
                  {parsed.answer}
                </p>
              )}
            </div>

            {/* 3. Reason Text Block */}
            {parsed.reason && (
              <div className="p-2.5 bg-black bg-opacity-35 rounded-lg border border-slate-800 flex items-start space-x-2 text-xs text-slate-300 leading-relaxed font-medium">
                <Lightbulb size={14} className="text-alertAmber shrink-0 mt-0.5" />
                <span><strong>Reasoning:</strong> {parsed.reason}</span>
              </div>
            )}

            {/* 4. Action Recommendation */}
            {parsed.action && (
              <div className="flex items-center space-x-1.5 text-xs text-pitchGreen font-bold">
                <CheckCircle size={14} />
                <span>Suggested Action: {parsed.action}</span>
              </div>
            )}

            {/* 5. Source grounding card below answer */}
            {parsed.source && (
              <div className="pt-2 border-t border-slate-800 flex justify-start">
                <SourceBadge source={parsed.source} />
              </div>
            )}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-lg bg-electricBlue text-white flex items-center justify-center shrink-0 shadow-lg">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
