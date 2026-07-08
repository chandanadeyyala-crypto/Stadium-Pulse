import React from 'react';

export default function FeatureCard({ title, description, icon: Icon, colorClass = 'text-electricBlue' }) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 glass-panel-hover flex flex-col space-y-3">
      <div className={`p-3 bg-stadiumNavy rounded-xl border border-slate-700/60 w-fit ${colorClass}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
