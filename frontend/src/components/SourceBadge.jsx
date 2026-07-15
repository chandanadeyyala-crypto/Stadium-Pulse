import { Landmark } from 'lucide-react';

export default function SourceBadge({ source }) {
  if (!source) return null;

  return (
    <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 inline-flex max-w-full">
      <Landmark size={13} className="text-pitchGreen shrink-0" />
      <span className="truncate" title={source}>
        Grounded: {source}
      </span>
    </div>
  );
}
