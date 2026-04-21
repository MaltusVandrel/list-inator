import React from 'react';
import {
  createCampaign,
  getCampaigns,
  deleteCampaign,
} from '../lib/campaign-storage';
import { scenarios } from '../data/index';
import type { Campaign } from '../types/index';

interface CampaignManagerProps {
  activeCampaign: Campaign | null;
  onCampaignCreated: (campaign: Campaign) => void;
  onCampaignSelected: (campaign: Campaign) => void;
  onCampaignBack: () => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  activeCampaign,
  onCampaignCreated,
  onCampaignSelected,
  onCampaignBack,
}) => {
  const [nameInput, setNameInput] = React.useState('');
  const [scenarioInput, setScenarioInput] = React.useState(scenarios[0].id);
  const [showForm, setShowForm] = React.useState(false);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(getCampaigns());

  const handleCreate = () => {
    if (!nameInput.trim()) return;

    const campaign = createCampaign(nameInput, scenarioInput);
    setNameInput('');
    setShowForm(false);
    setCampaigns(getCampaigns());
    onCampaignCreated(campaign);
  };

  const handleDelete = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(campaignId);
      setCampaigns(getCampaigns());
    }
  };

  // ACTIVE CAMPAIGN MODE: Show only campaign name with back button
  if (activeCampaign) {
    return (
      <div className="border-b-2 border-gothic-700 bg-gothic-900 p-3 sm:p-4 w-full flex items-center justify-between gap-3">
        <button
          onClick={onCampaignBack}
          className="flex-shrink-0 bg-gothic-700 hover:bg-gothic-600 text-white px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-colors whitespace-nowrap flex items-center gap-2">
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-blood-500 flex-1 truncate text-center">
          {activeCampaign.name}
        </h1>
        <div className="flex-shrink-0 w-12 sm:w-16" />
      </div>
    );
  }

  // CAMPAIGN SELECTION MODE: Show campaign list and create form
  return (
    <div className="border-b-2 border-gothic-700 bg-gothic-900 p-3 sm:p-4 w-full">
      <div className="flex flex-row justify-between gap-3 mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blood-500 mb-3 sm:mb-4">
          Campaigns{' '}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className=" sm:w-auto bg-blood-600 hover:bg-blood-700 text-white px-3 sm:px-4 py-2 rounded mb-3 sm:mb-4 font-semibold text-sm sm:text-base transition-colors">
          + New Campaign
        </button>
      </div>

      {showForm ? (
        <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Campaign name..."
            className="flex-1 px-3 py-2 bg-gothic-800 text-white border border-gothic-600 rounded text-sm sm:text-base"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <select
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            className="bg-gothic-800 text-white border border-gothic-600 rounded px-3 py-2 text-sm sm:text-base">
            {scenarios.map((scenario) => (
              <option
                key={scenario.id}
                value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={!nameInput.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-colors">
            Create
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="bg-gothic-700 hover:bg-gothic-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition-colors">
            Cancel
          </button>
        </div>
      ) : null}

      {campaigns.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <h2 className="text-xs sm:text-sm font-bold text-gothic-300 mb-2 uppercase">
            Available Campaigns
          </h2>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gothic-800 p-2 sm:p-3 rounded hover:bg-gothic-700 cursor-pointer transition-colors"
                onClick={() => onCampaignSelected(campaign)}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm sm:text-base truncate">
                    {campaign.name}
                  </p>
                  <p className="text-xs text-gothic-400">
                    {campaign.results.length} rolls • Created{' '}
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(campaign.id);
                  }}
                  className="text-red-500 hover:text-red-400 text-xs sm:text-sm font-bold self-start sm:self-auto transition-colors whitespace-nowrap">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
