import { useState } from "react";
import React from "react";
import type {
  Campaign,
  NestedRoll,
  Context,
  List,
  CampaignResult,
} from "./types/index";
import {
  getScenarioById,
  getContextFromScenario,
  scenarios,
} from "./data/index";
import {
  rollContext,
  rerrollItem,
  cascadeLockToChildren,
  getItemIdsFromRollTree,
} from "./lib/roller";
import {
  saveCampaignResult,
  getCampaignById,
  createCampaign,
  getCampaigns,
  deleteCampaign,
  generateResultId,
} from "./lib/campaign-storage";

function App() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [activeContextId, setActiveContextId] = useState<string | null>(null);
  const [currentRolls, setCurrentRolls] = useState<{
    [listId: string]: NestedRoll;
  } | null>(null);
  const [lockedItems, setLockedItems] = useState<Set<string>>(new Set());
  const [nameInput, setNameInput] = useState("");
  const [scenarioInput, setScenarioInput] = useState(scenarios[0].id);
  const [showForm, setShowForm] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(getCampaigns());
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Get current scenario from active campaign
  const scenario = activeCampaign
    ? getScenarioById(activeCampaign.scenarioId)
    : null;
  const activeContext =
    activeContextId && scenario
      ? getContextFromScenario(scenario.id, activeContextId)
      : null;

  // Handle campaign selection
  const handleCampaignSelected = (campaign: Campaign) => {
    setActiveCampaign(getCampaignById(campaign.id) || campaign);
    setActiveContextId(null);
    setCurrentRolls(null);
    setLockedItems(new Set());
  };

  // Handle campaign creation
  const handleCreate = () => {
    if (!nameInput.trim()) return;
    const campaign = createCampaign(nameInput, scenarioInput);
    setNameInput("");
    setShowForm(false);
    setCampaigns(getCampaigns());
    handleCampaignSelected(campaign);
  };

  // Handle campaign deletion
  const handleDelete = (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaign(campaignId);
      setCampaigns(getCampaigns());
    }
  };

  // Handle context selection
  const handleContextSelect = (contextId: string) => {
    setActiveContextId(contextId);
    setCurrentRolls(null);
    setLockedItems(new Set());
  };

  // Handle roll
  const handleRoll = () => {
    if (!activeContext || !scenario) return;

    const rolls = rollContext(activeContext, scenario, lockedItems);
    setCurrentRolls(rolls);

    // Save result to campaign
    if (activeCampaign) {
      const result = {
        id: generateResultId(),
        contextId: activeContext.id,
        contextTitle: activeContext.title,
        timestamp: Date.now(),
        rolls,
      };
      saveCampaignResult(activeCampaign.id, result);
      // Refresh campaign to reflect new result
      const updated = getCampaignById(activeCampaign.id);
      if (updated) setActiveCampaign(updated);
    }
  };

  // Handle item lock toggle
  const handleItemLockToggle = (itemId: string, shouldLock: boolean) => {
    const newLockedItems = new Set(lockedItems);

    if (shouldLock) {
      newLockedItems.add(itemId);

      // CASCADE: Find and lock all child items of this parent
      if (currentRolls) {
        for (const roll of Object.values(currentRolls)) {
          if (roll.selectedItem.id === itemId && roll.triggeredRolls) {
            // Lock all children
            for (const childId of getItemIdsFromRollTree(roll)) {
              if (childId !== itemId) {
                newLockedItems.add(childId);
              }
            }
            cascadeLockToChildren(roll, true);
          }
        }
      }
    } else {
      newLockedItems.delete(itemId);
      // Note: We don't unlock children when unlocking parent - user has independent control
    }

    setLockedItems(newLockedItems);
  };

  // Handle item reroll
  const handleItemReroll = (listId: string) => {
    if (!currentRolls || !activeContext || !scenario) return;

    const currentRoll = currentRolls[listId];
    if (!currentRoll) return;

    const isParentLocked =
      lockedItems.has(currentRoll.selectedItem.id) ||
      currentRoll.lockedByParent === true;
    const rerolledItem = rerrollItem(
      listId,
      scenario,
      activeContext,
      lockedItems,
      isParentLocked,
    );

    if (rerolledItem) {
      const newRolls = { ...currentRolls, [listId]: rerolledItem };
      setCurrentRolls(newRolls);
    }
  };

  // Handle going back to campaign selection
  const handleCampaignBack = () => {
    setActiveCampaign(null);
    setActiveContextId(null);
    setCurrentRolls(null);
    setLockedItems(new Set());
  };

  // ============================================
  // RENDER FUNCTIONS - Page sections
  // ============================================

  const renderCampaignHeader = () => {
    // ACTIVE CAMPAIGN MODE: Show only campaign name with back button
    if (activeCampaign) {
      return (
        <div className="border-b-2 border-gothic-700 bg-gothic-900 p-3 sm:p-4 w-full flex items-center justify-between gap-3">
          <button
            onClick={handleCampaignBack}
            className="flex-shrink-0 bg-gothic-700 hover:bg-gothic-600 text-white px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-colors whitespace-nowrap flex items-center gap-2"
          >
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
            Campaigns{" "}
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className=" sm:w-auto bg-blood-600 hover:bg-blood-700 text-white px-3 sm:px-4 py-2 rounded mb-3 sm:mb-4 font-semibold text-sm sm:text-base transition-colors"
          >
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
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <select
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              className="bg-gothic-800 text-white border border-gothic-600 rounded px-3 py-2 text-sm sm:text-base"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={!nameInput.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gothic-700 hover:bg-gothic-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition-colors"
            >
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
                  onClick={() => handleCampaignSelected(campaign)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base truncate">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-gothic-400">
                      {campaign.results.length} rolls • Created{" "}
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(campaign.id);
                    }}
                    className="text-red-500 hover:text-red-400 text-xs sm:text-sm font-bold self-start sm:self-auto transition-colors whitespace-nowrap"
                  >
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

  const renderScenarioDisplay = () => {
    if (!scenario) return null;

    return (
      <div className="bg-gothic-800 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gothic-700">
        <p className="text-xs sm:text-sm text-gothic-300">
          <span className="font-bold text-gothic-100">Scenario:</span>{" "}
          {scenario.title}
        </p>
      </div>
    );
  };

  const renderContextAndRoll = () => {
    return (
      <div className="bg-gothic-800 px-3 sm:px-4 py-2 sm:py-3 border-b border-gothic-700 flex items-center gap-2 sm:gap-3">
        <select
          value={activeContextId || ""}
          onChange={(e) => handleContextSelect(e.target.value)}
          className="px-3 width-stretch sm:px-4 py-2 sm:py-2.5 bg-gothic-700 text-gothic-100 border border-gothic-600 rounded font-semibold text-sm hover:bg-gothic-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blood-600 focus:border-transparent"
        >
          <option value="">Select Context</option>
          {scenario?.contexts?.map((context: Context) => (
            <option key={context.id} value={context.id}>
              {context.title}
            </option>
          ))}
        </select>
        {activeContext && (
          <button
            onClick={handleRoll}
            disabled={!activeContext}
            className="bg-blood-500 hover:bg-blood-600 disabled:bg-gray-600 text-white font-bold py-1.5 sm:py-2 px-4 sm:px-6 rounded text-sm sm:text-base shadow-lg transform hover:scale-105 transition-transform disabled:scale-100 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="fas fa-dice"></i>
            ROLL
          </button>
        )}
      </div>
    );
  };

  const findListById = (listId: string): List | undefined => {
    return scenario?.lists.find((list) => list.id === listId);
  };

  const renderRollItem = (
    listId: string,
    roll: NestedRoll,
    lists: List[],
    depth: number = 0,
  ): React.ReactNode => {
    const list = lists.find((l) => l.id === listId) || findListById(listId);
    if (!list) return null;

    const isItemLocked = lockedItems.has(roll.selectedItem.id);
    const isLockedByParent = roll.lockedByParent === true;
    const effectivelyLocked = isItemLocked || isLockedByParent;
    const indentStyle =
      depth > 0 ? { marginLeft: `${Math.min(depth * 20, 60)}px` } : {};

    return (
      <div
        key={`${listId}_${roll.selectedItem.id}_${depth}`}
        style={indentStyle}
        className="mb-3 sm:mb-4"
      >
        <div className="bg-gothic-800 rounded-lg border-2 border-gothic-700 hover:border-blood-600 transition-colors overflow-hidden shadow-md">
          {/* List Title */}
          <span className=" text-xs sm:text-sm font-bold text-gothic-300 uppercase flex-1 truncate px-3 py-2 block">
            {list.title}
          </span>
          <div className="bg-gothic-700 flex flex-col">
            <div className="flex flex-row width-full items-center gap-2 px-3 ">
              {/* Lock Button */}
              <button
                onClick={() =>
                  handleItemLockToggle(roll.selectedItem.id, !isItemLocked)
                }
                disabled={isLockedByParent}
                className="text-base text-xs px-3 py-1.5 disabled:opacity-50"
              >
                <i
                  className={`fas ${effectivelyLocked ? "fa-lock" : "fa-lock-open"}`}
                ></i>
              </button>
              {/* Selected Item */}
              <div
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 ${effectivelyLocked ? "bg-gothic-700 opacity-75" : "bg-gothic-900"}`}
              >
                <p
                  className={`font-bold text-sm ${isLockedByParent ? "text-gothic-500" : "text-blood-400"}`}
                >
                  {roll.selectedItem.title}
                </p>
              </div>
              {/* Reroll Button */}
              <button
                onClick={() => handleItemReroll(listId)}
                disabled={effectivelyLocked}
                title={
                  effectivelyLocked
                    ? "Cannot reroll locked item"
                    : "Reroll this item"
                }
                className="text-base text-xs px-3 py-1.5 disabled:opacity-50"
              >
                <i className="fas fa-sync"></i>
              </button>
            </div>
            <div>
              {roll.selectedItem.description && (
                <p className="text-xs sm:text-sm text-gothic-300 px-4 pb-2">
                  {roll.selectedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {roll.triggeredRolls?.map((childRoll) =>
          renderRollItem(childRoll.listId, childRoll, lists, depth + 1),
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!currentRolls || Object.keys(currentRolls).length === 0) {
      return (
        <div className="p-3 sm:p-4 text-center text-gothic-400 text-sm sm:text-base">
          <p>Select a context and press ROLL to generate results</p>
        </div>
      );
    }

    return (
      <div className="pt-2 sm:pt-4 px-2 sm:px-4">
        {Object.entries(currentRolls).map(([listId, roll]) =>
          renderRollItem(listId, roll, scenario?.lists || [], 0),
        )}
      </div>
    );
  };

  const renderCampaignHistory = () => {
    if (!activeCampaign || activeCampaign.results.length === 0) {
      return null;
    }

    const formatRollSummary = (result: CampaignResult): string => {
      const items = Object.entries(result.rolls)
        .map(([, roll]) => roll.selectedItem.title)
        .join(" • ");
      return items;
    };

    return (
      <div className="border-t-2 border-gothic-700 bg-gothic-900">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="w-full px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gothic-800 transition-colors text-left"
        >
          <p className="font-bold text-blood-500 text-sm sm:text-base">
            {historyExpanded ? "▼" : "▶️"} Campaign History (
            {activeCampaign.results.length})
          </p>
        </button>

        {historyExpanded && (
          <div className="max-h-48 sm:max-h-64 overflow-y-auto bg-gothic-950 px-2 sm:px-4 py-2 sm:py-3 space-y-2">
            {[...activeCampaign.results].reverse().map((result) => (
              <div
                key={result.id}
                className="text-xs sm:text-sm bg-gothic-800 p-2 rounded border-l-2 border-blood-600"
              >
                <p className="text-gothic-300">
                  <span className="font-bold text-gothic-300">
                    {result.contextTitle}:{" "}
                  </span>{" "}
                  {formatRollSummary(result)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-screen h-screen bg-gothic-900 flex flex-col overflow-hidden">
      {renderCampaignHeader()}

      {activeCampaign && scenario && (
        <>
          {renderScenarioDisplay()}
          {renderContextAndRoll()}

          {activeContext && (
            <>
              <div className="flex-1 w-full overflow-y-auto bg-gothic-950">
                {renderResults()}
              </div>

              {renderCampaignHistory()}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
