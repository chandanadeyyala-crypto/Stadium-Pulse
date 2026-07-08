import React from 'react';

export default function AccessibilityToggle({ label, description, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-stadiumNavy/40 border border-slate-800 hover:border-slate-700/60 transition-all">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-bold text-white block cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-xs text-slate-400 font-medium">
            {description}
          </span>
        )}
      </div>

      {/* Switch Switcher */}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electricBlue focus:ring-offset-2 focus:ring-offset-primaryDark ${
          checked ? 'bg-electricBlue' : 'bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
