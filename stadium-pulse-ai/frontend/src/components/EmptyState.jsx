import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'There are no active records in this section right now.', icon: Icon = HelpCircle }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-800 rounded-2xl bg-stadiumNavy/10">
      <div className="p-3 bg-stadiumNavy rounded-xl text-slate-500 mb-3 border border-slate-800">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
        {message}
      </p>
    </div>
  );
}
