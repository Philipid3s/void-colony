import { v4 as uuidv4 } from 'uuid';

import { canStartConstruction, startConstruction } from '../engine/buildingEngine';
import { startResearch } from '../engine/researchEngine';
import { BUILDINGS } from '../config/buildings';
import { ResourceId } from '../config/resources';
import { TechId } from '../config/techs';
import { BuildingInstance, GameState, TaskId } from '../models/GameState';

const MINE_BASIC_RESOURCES = new Set<ResourceId>(['iron_ore', 'coal', 'sand', 'clay', 'copper', 'aluminium', 'silicon', 'sulfur']);
const MINE_ADV_RESOURCES = new Set<ResourceId>([...MINE_BASIC_RESOURCES, 'titanium', 'nickel', 'lithium', 'gold', 'rare_earth', 'uranium', 'helium3']);

export function assignCrewTask(state: GameState, crewId: string, taskId: TaskId | null, buildingId: string | null): boolean {
  const crew = state.crew.find(c => c.id === crewId);
  if (!crew) return false;

  crew.assignedTask = taskId;
  crew.assignedBuildingId = buildingId;
  return true;
}

export function assignCrewTasksBulk(state: GameState, assignments: { crewId: string; taskId: TaskId | null; buildingId: string | null }[]): number {
  let updated = 0;
  for (const assignment of assignments) {
    if (assignCrewTask(state, assignment.crewId, assignment.taskId, assignment.buildingId)) {
      updated += 1;
    }
  }
  return updated;
}

export type StartBuildResult =
  | { ok: true; building: BuildingInstance }
  | { ok: false; error: 'invalid_type' | 'missing_tech' | 'insufficient_resources'; details?: string };

export function startBuild(state: GameState, buildingType: string): StartBuildResult {
  const check = canStartConstruction(state, buildingType);
  if (!check.ok) {
    return { ok: false, error: check.reason, details: check.details };
  }

  const building = startConstruction(state, buildingType);
  if (!building) {
    return { ok: false, error: 'invalid_type' };
  }

  return { ok: true, building };
}

export type StartResearchResult =
  | { ok: true }
  | { ok: false; error: 'cannot_research' };

export function beginResearch(state: GameState, techId: TechId): StartResearchResult {
  const ok = startResearch(state, techId);
  if (!ok) return { ok: false, error: 'cannot_research' };
  return { ok: true };
}

export type SetMineResourceResult =
  | { ok: true }
  | { ok: false; error: 'building_not_found' | 'not_a_mine' | 'invalid_resource_for_mine' };

export function setMineResource(state: GameState, buildingId: string, resource: string): SetMineResourceResult {
  const building = state.buildings.find(b => b.id === buildingId);
  if (!building) return { ok: false, error: 'building_not_found' };
  if (building.type !== 'mine_basic' && building.type !== 'mine_advanced') {
    return { ok: false, error: 'not_a_mine' };
  }

  const mineResource = resource as ResourceId;
  const allowed = building.type === 'mine_basic' ? MINE_BASIC_RESOURCES : MINE_ADV_RESOURCES;
  if (!allowed.has(mineResource)) {
    return { ok: false, error: 'invalid_resource_for_mine' };
  }

  building.miningResource = mineResource;
  return { ok: true };
}

export function dismantleBuilding(state: GameState, buildingId: string): { refund: Record<string, number> } | null {
  const idx = state.buildings.findIndex(b => b.id === buildingId);
  if (idx === -1) return null;

  const building = state.buildings[idx];
  const def = BUILDINGS[building.type];
  const refund: Record<string, number> = {};

  if (def && def.cost.length > 0) {
    const progressFactor = building.status === 'constructing'
      ? building.constructionProgress / 100
      : 1;

    for (const c of def.cost) {
      const amount = Math.floor(c.amount * 0.5 * progressFactor);
      if (amount > 0) {
        state.resources[c.resource] = (state.resources[c.resource] ?? 0) + amount;
        refund[c.resource] = amount;
      }
    }
  }

  unassignCrewFromBuilding(state, buildingId);
  state.buildings.splice(idx, 1);
  return { refund };
}

export type SetBuildingPowerResult =
  | { ok: true }
  | { ok: false; error: 'building_not_found' };

export function setBuildingPower(state: GameState, buildingId: string, powered: boolean): SetBuildingPowerResult {
  const building = state.buildings.find(b => b.id === buildingId);
  if (!building) return { ok: false, error: 'building_not_found' };

  building.powered = powered;
  if (!powered) {
    unassignCrewFromBuilding(state, buildingId);
  }

  return { ok: true };
}

export function scavengeShip(state: GameState, randomInt: (min: number, max: number) => number = defaultRandomInt): { gained: Record<string, number>; scavengeCount: number; remaining: number } | null {
  const maxScavenges = 4;
  if (state.shipScavengeCount >= maxScavenges) {
    return null;
  }

  const round = state.shipScavengeCount + 1;
  const hauls: Record<number, Array<{ resource: string; min: number; max: number }>> = {
    1: [
      { resource: 'iron_ore', min: 70, max: 100 },
      { resource: 'steel', min: 30, max: 50 },
      { resource: 'copper', min: 15, max: 25 },
      { resource: 'coal', min: 15, max: 25 },
      { resource: 'plastic', min: 15, max: 25 },
      { resource: 'electronics', min: 8, max: 15 },
    ],
    2: [
      { resource: 'iron_ore', min: 40, max: 65 },
      { resource: 'steel', min: 15, max: 30 },
      { resource: 'copper', min: 8, max: 18 },
      { resource: 'coal', min: 8, max: 15 },
      { resource: 'plastic', min: 8, max: 15 },
      { resource: 'electronics', min: 4, max: 10 },
    ],
    3: [
      { resource: 'iron_ore', min: 20, max: 40 },
      { resource: 'steel', min: 5, max: 15 },
      { resource: 'copper', min: 5, max: 10 },
      { resource: 'plastic', min: 3, max: 8 },
      { resource: 'electronics', min: 2, max: 5 },
    ],
    4: [
      { resource: 'iron_ore', min: 10, max: 20 },
      { resource: 'coal', min: 5, max: 10 },
    ],
  };

  const gained: Record<string, number> = {};
  for (const entry of hauls[round] ?? []) {
    const amount = randomInt(entry.min, entry.max);
    state.resources[entry.resource] = (state.resources[entry.resource] ?? 0) + amount;
    gained[entry.resource] = amount;
  }

  state.shipScavengeCount += 1;

  if (state.shipScavengeCount >= maxScavenges) {
    const ship = state.buildings.find((b): b is BuildingInstance => b.type === 'ship');
    if (ship) {
      unassignCrewFromBuilding(state, ship.id);
      state.buildings = state.buildings.filter(b => b.id !== ship.id);
    }
  }

  const remaining = maxScavenges - state.shipScavengeCount;
  const lootSummary = Object.entries(gained).map(([r, n]) => `${n} ${r.replace(/_/g, ' ')}`).join(', ');
  const roundSuffix = remaining === 0
    ? 'The ship is now completely stripped.'
    : `(${remaining} scavenge${remaining !== 1 ? 's' : ''} remaining)`;

  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message: `Ship scavenged — recovered: ${lootSummary}. ${roundSuffix}`,
    type: 'success',
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();

  return { gained, scavengeCount: state.shipScavengeCount, remaining };
}

export type ScoutTileResult =
  | { ok: true; newTiles: number }
  | { ok: false; error: 'out_of_bounds' | 'no_scouts' };

export function scoutTile(state: GameState, x: number, y: number): ScoutTileResult {
  if (y < 0 || y >= state.map.length || x < 0 || x >= state.map[0].length) {
    return { ok: false, error: 'out_of_bounds' };
  }

  const scouts = state.crew.filter(c => c.isAlive && c.assignedTask === 'task_scout');
  if (scouts.length === 0) {
    return { ok: false, error: 'no_scouts' };
  }

  let newTiles = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < state.map.length && nx >= 0 && nx < state.map[0].length) {
        if (!state.map[ny][nx].explored) {
          state.map[ny][nx].explored = true;
          newTiles++;
        }
      }
    }
  }

  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message: `Scout party sent to (${x},${y}) — ${newTiles} new tile${newTiles !== 1 ? 's' : ''} revealed.`,
    type: 'info',
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();

  return { ok: true, newTiles };
}

function unassignCrewFromBuilding(state: GameState, buildingId: string): void {
  for (const crew of state.crew) {
    if (crew.assignedBuildingId === buildingId) {
      crew.assignedTask = null;
      crew.assignedBuildingId = null;
    }
  }
}

function defaultRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
