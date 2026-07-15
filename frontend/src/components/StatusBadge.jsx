import React from 'react';

export default function StatusBadge({ status, text }) {
  const getBadgeStyles = () => {
    const s = (status || '').toLowerCase();

    if (['open', 'safe', 'normal', 'low', 'approved', 'online'].includes(s)) {
      return {
        bg: 'bg-emerald-500/10 text-pitchGreen border-pitchGreen/30',
        dot: 'bg-pitchGreen'
      };
    }

    if (['warning', 'crowded', 'medium', 'busy', 'pending_approval', 'pending'].includes(s)) {
      return {
        bg: 'bg-amber-500/10 text-alertAmber border-alertAmber/30',
        dot: 'bg-alertAmber'
      };
    }

    if (['closed', 'critical', 'blocked', 'emergency', 'offline'].includes(s)) {
      return {
        bg: 'bg-red-500/10 text-criticalRed border-criticalRed/30',
        dot: 'bg-criticalRed animate-pulse'
      };
    }

    return {
      bg: 'bg-blue-500/10 text-electricBlue border-electricBlue/30',
      dot: 'bg-electricBlue'
    };
  };

  const styles = getBadgeStyles();
  const displayText = text || status.toUpperCase();

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <span>{displayText}</span>
    </span>
  );
}
