import type { List, Scenario } from "../types/index";
import wodScenarioJson from "./wod-scenario.json";
import vampireListsJson from "./vampire-lists.json";
import werewolfListsJson from "./werewolf-lists.json";
import changelingListsJson from "./changeling-lists.json";
import revenousListsJson from "./ravenous-lists.json";
import generalListsJson from "./general-lists.json";
import wodAdvantageListsJson from "./wod-advantages-lists.json";

const vampireLists: List[] = vampireListsJson as List[];
const werewolfLists: List[] = werewolfListsJson as List[];
const changelingLists: List[] = changelingListsJson as List[];
const ravenousLists: List[] = revenousListsJson as List[];
const generalLists: List[] = generalListsJson as List[];
const wodAdvantageLists: List[] = wodAdvantageListsJson as List[];

const wodScenario = wodScenarioJson as Scenario;
wodScenario.lists.push(
  ...generalLists,
  ...wodAdvantageLists,
  ...vampireLists,
  ...werewolfLists,
  ...changelingLists,
  ...ravenousLists,
);
export const scenarios: Scenario[] = [wodScenario];

export const getScenarioById = (id: string): Scenario | undefined => {
  return scenarios.find((s) => s.id === id);
};

export const getContextFromScenario = (
  scenarioId: string,
  contextId: string,
) => {
  const scenario = getScenarioById(scenarioId);
  return scenario?.contexts.find((c) => c.id === contextId);
};

export const getList = (scenarioId: string, listId: string) => {
  const scenario = getScenarioById(scenarioId);
  return scenario?.lists.find((l) => l.id === listId);
};

export const getItemFromList = (
  scenarioId: string,
  listId: string,
  itemId: string,
) => {
  const list = getList(scenarioId, listId);
  return list?.items.find((i) => i.id === itemId);
};
