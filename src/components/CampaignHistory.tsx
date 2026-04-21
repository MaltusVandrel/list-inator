import React, { useState } from 'react';
import type { Campaign, CampaignResult } from '../types/index';

interface CampaignHistoryProps {
  campaign: Campaign | null;
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({
  campaign,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!campaign || campaign.results.length === 0) {
    return null;
  }

  const formatRollSummary = (result: CampaignResult): string => {
    const items = Object.entries(result.rolls)
      .map(([, roll]) => roll.selectedItem.title)
      .join(' • ');
    return items;
  };

  return (
    <div className="border-t-2 border-gothic-700 bg-gothic-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gothic-800 transition-colors text-left">
        <p className="font-bold text-blood-500 text-sm sm:text-base">
          {isExpanded ? '▼' : '▶️'} Campaign History ({campaign.results.length})
        </p>
      </button>

      {isExpanded && (
        <div className="max-h-48 sm:max-h-64 overflow-y-auto bg-gothic-950 px-2 sm:px-4 py-2 sm:py-3 space-y-2">
          {[...campaign.results].reverse().map((result, idx) => (
            <div
              key={result.id}
              className="text-xs sm:text-sm bg-gothic-800 p-2 rounded border-l-2 border-blood-600">
              <p className="text-gothic-300">
                <span className="font-bold text-gothic-300">
                  {result.contextTitle}:{' '}
                </span>{' '}
                {formatRollSummary(result)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
