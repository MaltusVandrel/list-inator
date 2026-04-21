import React from 'react';
import type { NestedRoll, List } from '../types/index';

interface ResultDisplayProps {
  rolls: { [listId: string]: NestedRoll } | null;
  lists: List[];
  lockedItems: Set<string>;
  onItemLockToggle: (itemId: string, locked: boolean) => void;
  onItemReroll: (listId: string) => void;
  depth?: number;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  rolls,
  lists,
  lockedItems,
  onItemLockToggle,
  onItemReroll,
  depth = 0,
}) => {
  if (!rolls || Object.keys(rolls).length === 0) {
    return (
      <div className="p-3 sm:p-4 text-center text-gothic-400 text-sm sm:text-base">
        <p>Select a context and press ROLL to generate results</p>
      </div>
    );
  }

  // Use inline style for indentation instead of dynamic Tailwind classes
  const indentStyle =
    depth > 0 ? { marginLeft: `${Math.min(depth * 16, 48)}px` } : {};
  const paddingClass = depth > 0 ? 'pt-1 sm:pt-2' : 'pt-2 sm:pt-4';

  return (
    <div
      className={`${paddingClass} px-2 sm:px-4`}
      style={indentStyle}>
      {Object.entries(rolls).map(([listId, roll]) => {
        const list = lists.find((l) => l.id === listId);
        if (!list) return null;

        const isItemLocked = lockedItems.has(roll.selectedItem.id);
        const isLockedByParent = roll.lockedByParent === true;
        const effectivelyLocked = isItemLocked || isLockedByParent;

        return (
          <div
            key={`${listId}_${depth}`}
            className="mb-3 sm:mb-4">
            <div className="bg-gothic-800 rounded-lg border-2 border-gothic-700 hover:border-blood-600 transition-colors overflow-hidden shadow-md">
              {/* List Title */}
              <span className="hover-title text-xs sm:text-sm font-bold text-gothic-300 uppercase flex-1 truncate">
                {list.title}
              </span>
              <div className="bg-gothic-700  flex justify-between items-center gap-2">
                <div className="flex flex-row width-full">
                  {/* Lock Button */}
                  <button
                    onClick={() =>
                      onItemLockToggle(roll.selectedItem.id, !isItemLocked)
                    }
                    disabled={isLockedByParent}
                    title={
                      isLockedByParent
                        ? 'Locked by parent'
                        : isItemLocked
                          ? 'Click to unlock'
                          : 'Click to lock'
                    }
                    className="text-base sm:text-lg hover:scale-110 transition-transform disabled:opacity-50">
                    <i
                      className={`fas ${effectivelyLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                  </button>
                  {/* Selected Item */}
                  <div
                    className={`px-2 sm:px-4 py-2 sm:py-3 ${effectivelyLocked ? 'bg-gothic-700 opacity-75' : 'bg-gothic-900'}`}>
                    <p
                      className={`font-bold text-sm sm:text-lg ${isLockedByParent ? 'text-gothic-500' : 'text-blood-400'}`}>
                      {roll.selectedItem.title}
                    </p>
                  </div>
                  {/* Reroll Button */}
                  <button
                    onClick={() => onItemReroll(listId)}
                    disabled={effectivelyLocked}
                    title={
                      effectivelyLocked
                        ? 'Cannot reroll locked item'
                        : 'Reroll this item'
                    }
                    className="text-base sm:text-lg hover:scale-110 transition-transform disabled:opacity-50">
                    <i className="fas fa-sync"></i>
                  </button>
                </div>
                <div>
                  {roll.selectedItem.description && (
                    <p className="text-xs sm:text-sm text-gothic-300 mt-1">
                      {roll.selectedItem.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Triggered Rolls (Nested) */}
            </div>
          </div>
        );
      })}
    </div>
  );
};
