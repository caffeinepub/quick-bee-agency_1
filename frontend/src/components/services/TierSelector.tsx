import React from 'react';
import formatINR from '../../utils/formatCurrency';

interface TierOption {
  tierName: string;
  priceINR: number;
}

interface TierSelectorProps {
  tiers: TierOption[];
  selectedTier: string;
  onTierChange: (tierName: string) => void;
}

export default function TierSelector({ tiers, selectedTier, onTierChange }: TierSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tiers.map((tier) => (
        <button
          key={tier.tierName}
          onClick={() => onTierChange(tier.tierName)}
          className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all cursor-pointer ${
            selectedTier === tier.tierName
              ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
              : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          <span className="font-semibold">{tier.tierName}</span>
          <span className={`text-sm font-bold mt-0.5 ${selectedTier === tier.tierName ? 'text-primary-foreground' : 'text-primary'}`}>
            {formatINR(tier.priceINR)}
          </span>
        </button>
      ))}
    </div>
  );
}
