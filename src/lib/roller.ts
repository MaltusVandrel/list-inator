import type { List, Context, Scenario, Item, NestedRoll } from "../types/index";
import { getList } from "../data/index";

const MAX_TRIGGER_DEPTH = 6;

/**
 * Select random item from a list (excluding locked items)
 */
export const rollList = (list: List, lockedItems?: Set<string>): Item => {
  // Filter out locked items
  const availableItems = list.items.filter(
    (item) => !lockedItems?.has(item.id),
  );

  if (availableItems.length === 0) {
    // If all items locked, return random anyway (shouldn't happen in normal use)
    return list.items[Math.floor(Math.random() * list.items.length)];
  }

  return availableItems[Math.floor(Math.random() * availableItems.length)];
};

/**
 * Recursively resolve triggered rolls for an item
 * Tracks visited triggers to prevent circular dependencies
 */
const resolveTriggeredRolls = (
  item: Item,
  scenario: Scenario,
  lockedItems?: Set<string>,
  visitedTriggers: Set<string> = new Set(),
  currentDepth: number = 0,
): NestedRoll[] => {
  if (
    !item.triggers ||
    item.triggers.length === 0 ||
    currentDepth >= MAX_TRIGGER_DEPTH
  ) {
    return [];
  }

  return item.triggers
    .filter((trigger) => {
      const triggerId = `${trigger.listDefs}`;
      if (visitedTriggers.has(triggerId)) {
        console.warn(`Circular trigger detected: ${triggerId}`);
        return false;
      }
      return true;
    })
    .map((trigger) => {
      const triggerId = `${trigger.listDefs}`;
      const newVisited = new Set(visitedTriggers);
      newVisited.add(triggerId);

      const list = getList(scenario.id, trigger.listDefs);
      if (!list) {
        console.warn(`Triggered list not found: ${triggerId}`);
        return undefined;
      }

      const selectedItem = rollList(list, lockedItems);

      return {
        listId: trigger.listDefs,
        selectedItem,
        triggeredRolls: resolveTriggeredRolls(
          selectedItem,
          scenario,
          lockedItems,
          newVisited,
          currentDepth + 1,
        ),
      };
    })
    .filter((roll) => roll !== undefined) as NestedRoll[];
};

/**
 * Roll all lists in a context, auto-triggering dependent rolls
 */
export const rollContext = (
  context: Context,
  scenario: Scenario,
  lockedItems?: Set<string>,
): { [listId: string]: NestedRoll } => {
  const rolls: { [listId: string]: NestedRoll } = {};

  for (const listId of context.listDefs) {
    const list = getList(scenario.id, listId);
    if (!list) continue;

    const selectedItem = rollList(list, lockedItems);

    rolls[list.id] = {
      listId: list.id,
      selectedItem,
      triggeredRolls: resolveTriggeredRolls(
        selectedItem,
        scenario,
        lockedItems,
      ),
    };
  }

  return rolls;
};

/**
 * Reroll a specific item and its triggered rolls
 * If parent is locked, children are also locked
 */
export const rerrollItem = (
  listId: string,
  scenario: Scenario,
  context: Context,
  lockedItems?: Set<string>,
  isParentLocked: boolean = false,
): NestedRoll | undefined => {
  if (!context.listDefs.includes(listId)) return undefined;
  const list = getList(scenario.id, listId);
  if (!list) return undefined;

  const selectedItem = rollList(list, lockedItems);

  // Build new triggered rolls
  let triggeredRolls: NestedRoll[] = [];
  if (!isParentLocked) {
    // Only resolve triggers if parent is not locked
    triggeredRolls = resolveTriggeredRolls(selectedItem, scenario, lockedItems);
  }

  return {
    listId,
    selectedItem,
    lockedByParent: isParentLocked ? true : undefined,
    triggeredRolls,
  };
};

/**
 * Recursively mark all child rolls as locked when parent is locked
 */
export const cascadeLockToChildren = (
  roll: NestedRoll,
  shouldLock: boolean,
): void => {
  if (roll.triggeredRolls) {
    for (const childRoll of roll.triggeredRolls) {
      childRoll.lockedByParent = shouldLock ? true : undefined;
      cascadeLockToChildren(childRoll, shouldLock);
    }
  }
};

/**
 * Check if a roll is locked (either directly or by parent)
 */
export const isRollLocked = (
  roll: NestedRoll,
  directLocks: Set<string>,
): boolean => {
  const isDirectLocked = directLocks.has(roll.selectedItem.id);
  const isLockedByParent = roll.lockedByParent === true;
  return isDirectLocked || isLockedByParent;
};

/**
 * Get all item IDs from a roll tree (for batch locking)
 */
export const getItemIdsFromRollTree = (roll: NestedRoll): string[] => {
  const ids = [roll.selectedItem.id];
  if (roll.triggeredRolls) {
    for (const childRoll of roll.triggeredRolls) {
      ids.push(...getItemIdsFromRollTree(childRoll));
    }
  }
  return ids;
};
