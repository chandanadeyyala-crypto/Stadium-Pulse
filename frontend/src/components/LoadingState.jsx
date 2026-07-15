import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading intelligence records...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <Loader2 size={36} className="text-electricBlue animate-spin" />
      <p className="text-sm text-slate-400 font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}
