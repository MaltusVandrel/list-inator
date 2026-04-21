/**
 * Core data structures for the RPG Resource Generator
 */

export interface Trigger {
  listDefs: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  triggers?: Trigger[];
  metadata?: { [key: string]: any };
  properties?: { [key: string]: any };
}

export interface List {
  id: string;
  title: string;
  items: Item[];
}

export interface Context {
  id: string;
  title: string;
  listDefs: string[];
}

export interface Scenario {
  id: string;
  title: string;
  lists: List[];
  contexts: Context[];
}

/**
 * Result structures (hierarchical/nested)
 */

export interface NestedRoll {
  listId: string;
  selectedItem: Item;
  lockedByParent?: boolean; // true if parent is locked, cascades lock down
  triggeredRolls?: NestedRoll[];
}

export interface CampaignResult {
  id: string;
  contextId: string;
  contextTitle: string;
  timestamp: number;
  rolls: { [listId: string]: NestedRoll };
}

export interface Campaign {
  id: string;
  name: string;
  scenarioId: string;
  createdAt: number;
  results: CampaignResult[];
}

/**
 * UI State
 */

export interface LockedState {
  [rollId: string]: boolean; // rollId = `${listId}` at each nesting level
}
