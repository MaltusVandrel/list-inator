import type { Campaign, CampaignResult } from '../types/index';

const CAMPAIGNS_KEY = 'list_inator_campaigns';

export const createCampaign = (name: string, scenarioId: string): Campaign => {
  const campaign: Campaign = {
    id: `campaign_${crypto.randomUUID()}`,
    name,
    scenarioId,
    createdAt: Date.now(),
    results: [],
  };

  const campaigns = getCampaigns();
  campaigns.push(campaign);
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));

  return campaign;
};

export const getCampaigns = (): Campaign[] => {
  const stored = localStorage.getItem(CAMPAIGNS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    console.error('Failed to parse campaigns from localStorage');
    return [];
  }
};

export const getCampaignById = (campaignId: string): Campaign | undefined => {
  const campaigns = getCampaigns();
  return campaigns.find((c) => c.id === campaignId);
};

export const updateCampaign = (campaign: Campaign): void => {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === campaign.id);
  if (index !== -1) {
    campaigns[index] = campaign;
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }
};

export const saveCampaignResult = (
  campaignId: string,
  result: CampaignResult,
): void => {
  const campaign = getCampaignById(campaignId);
  if (campaign) {
    campaign.results.push(result);
    updateCampaign(campaign);
  }
};

export const deleteCampaign = (campaignId: string): void => {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter((c) => c.id !== campaignId);
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(filtered));
};

export const generateResultId = (): string => {
  return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
