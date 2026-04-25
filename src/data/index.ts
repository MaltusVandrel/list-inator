import type { List, Scenario } from "../types/index";
import wodScenarioJson from "./wod-scenario.json";
import vampireListsJson from "./vampire-lists.json";
import werewolfListsJson from "./werewolf-lists.json";
import changelingListsJson from "./changeling-lists.json";
import revenousListsJson from "./ravenous-lists.json";
import generalListsJson from "./general-lists.json";
import wodAdvantageListsJson from "./wod-advantages-lists.json";

import mortalListsJson from "./mortal-lists.json";
import psyListsJson from "./psy-lists.json";
import backgroundListsJson from "./background-lists.json";
import hunterListsJson from "./hunter-lists.json";
import hollowListsJson from "./hollow-lists.json";
import wraithListsJson from "./wraith-lists.json";
import createdListsJson from "./created-lists.json";
import mageListsJson from "./mage-lists.json";
import zombieListsJson from "./zombie-lists.json";
import demonListsJson from "./demon-lists.json";
import angelListsJson from "./angel-lists.json";
import cryptidListsJson from "./cryptid-lists.json";
import otherBeingsListsJson from "./other-beings-lists.json";
import questListsJson from "./quest-lists.json";

const vampireLists: List[] = vampireListsJson as List[];
const werewolfLists: List[] = werewolfListsJson as List[];
const changelingLists: List[] = changelingListsJson as List[];
const ravenousLists: List[] = revenousListsJson as List[];
const mortalLists: List[] = mortalListsJson as List[];
const psyLists: List[] = psyListsJson as List[];
const backgroundLists: List[] = backgroundListsJson as List[];
const hunterLists: List[] = hunterListsJson as List[];
const generalLists: List[] = generalListsJson as List[];
const hollowLists: List[] = hollowListsJson as List[];
const wraithLists: List[] = wraithListsJson as List[];
const createdLists: List[] = createdListsJson as List[];
const mageLists: List[] = mageListsJson as List[];
const zombieLists: List[] = zombieListsJson as List[];
const demonLists: List[] = demonListsJson as List[];
const angelLists: List[] = angelListsJson as List[];
const cryptidLists: List[] = cryptidListsJson as List[];
const otherBeingsLists: List[] = otherBeingsListsJson as List[];
const questLists: List[] = questListsJson as List[];

const wodAdvantageLists: List[] = wodAdvantageListsJson as List[];

const wodScenario = wodScenarioJson as Scenario;
wodScenario.lists.push(
  ...generalLists,
  ...wodAdvantageLists,
  ...vampireLists,
  ...werewolfLists,
  ...changelingLists,
  ...ravenousLists,
  ...mortalLists,
  ...psyLists,
  ...backgroundLists,
  ...hunterLists,
  ...hollowLists,
  ...wraithLists,
  ...createdLists,
  ...mageLists,
  ...zombieLists,
  ...demonLists,
  ...angelLists,
  ...cryptidLists,
  ...otherBeingsLists,
  ...questLists,
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
