import { GameState, BuildingInstance } from '../models/GameState';
import { BUILDINGS } from '../config/buildings';
import { BASE_STORAGE_CAPACITY } from '../config/balance';
import { v4 as uuidv4 } from 'uuid';

export type ConstructionFailureReason =
  | 'invalid_type'
  | 'missing_tech'
  | 'insufficient_resources';

export type ConstructionCheckResult =
  | { ok: true }
  | { ok: false; reason: ConstructionFailureReason; details?: string };

export function tickBuildings(state: GameState): void {
  for (const building of state.buildings) {
    if (building.status !== 'constructing') continue;

    const def = BUILDINGS[building.type];
    if (!def) continue;

    const workers = state.crew.filter(
      c => c.isAlive && c.assignedTask === 'task_build' && c.assignedBuildingId === building.id
    ).length;

    if (workers === 0) continue;

    const progressPerTick = (100 / def.buildTimeTicks) * workers;
    building.constructionProgress = Math.min(100, building.constructionProgress + progressPerTick);

    if (building.constructionProgress >= 100) {
      building.status = 'operational';
      building.constructionProgress = 100;
      addLog(state, `Construction complete: ${def.name}`, 'success');

      // Reassign builders
      for (const crew of state.crew) {
        if (crew.assignedTask === 'task_build' && crew.assignedBuildingId === building.id) {
          crew.assignedTask = null;
          crew.assignedBuildingId = null;
        }
      }
    }
  }

  // Recalculate storage capacity
  let storage = BASE_STORAGE_CAPACITY;
  for (const building of state.buildings) {
    if (building.status !== 'operational') continue;
    const def = BUILDINGS[building.type];
    if (def?.storageBonus) storage += def.storageBonus;
  }
  state.storageCapacity = storage;
}

export function canStartConstruction(state: GameState, buildingType: string): ConstructionCheckResult {
  const def = BUILDINGS[buildingType as keyof typeof BUILDINGS];
  if (!def) return { ok: false, reason: 'invalid_type' };

  if (def.prereqTech) {
    const prereq = state.research.find(r => r.techId === def.prereqTech);
    if (!prereq || prereq.status !== 'completed') {
      return { ok: false, reason: 'missing_tech', details: def.prereqTech };
    }
  }

  for (const cost of def.cost) {
    if ((state.resources[cost.resource] ?? 0) < cost.amount) {
      return { ok: false, reason: 'insufficient_resources' };
    }
  }

  return { ok: true };
}

export function startConstruction(state: GameState, buildingType: string): BuildingInstance | null {
  const check = canStartConstruction(state, buildingType);
  if (!check.ok) return null;

  const def = BUILDINGS[buildingType as keyof typeof BUILDINGS];
  if (!def) return null;

  // Deduct resources
  for (const cost of def.cost) {
    state.resources[cost.resource] = (state.resources[cost.resource] ?? 0) - cost.amount;
  }

  const instance: BuildingInstance = {
    id: uuidv4(),
    type: def.id,
    status: def.buildTimeTicks === 0 ? 'operational' : 'constructing',
    constructionProgress: def.buildTimeTicks === 0 ? 100 : 0,
    condition: 100,
    powered: true,
    level: 1,
  };

  state.buildings.push(instance);
  addLog(state, `Started construction: ${def.name}`, 'info');
  return instance;
}

function addLog(state: GameState, message: string, type: 'info'|'warning'|'danger'|'success'|'event'): void {
  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message,
    type,
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();
}
