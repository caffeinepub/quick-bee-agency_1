import React from 'react';
import { Badge } from '@/components/ui/badge';
import { computeQualificationTier } from '../../utils/exportUtils';

interface QualificationBadgeProps {
  score: number;
  showScore?: boolean;
}

export { computeQualificationTier };

export default function QualificationBadge({ score, showScore = false }: QualificationBadgeProps) {
  const tier = computeQualificationTier(score);

  const styles: Record<string, string> = {
    Qualified: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    Hot: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    Warm: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    Cold: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
  };

  const icons: Record<string, string> = {
    Qualified: '🏆',
    Hot: '🔥',
    Warm: '☀️',
    Cold: '❄️',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[tier]}`}>
      <span>{icons[tier]}</span>
      <span>{tier}</span>
      {showScore && <span className="opacity-70">({score})</span>}
    </span>
  );
}
