import { GameState } from '../models/GameState';
import { BUILDINGS } from '../config/buildings';
import {
  CREW_WATER_PER_TICK, CREW_FOOD_PER_TICK, CREW_OXYGEN_PER_TICK,
  DIFFICULTY_MULTIPLIERS,
} from '../config/balance';

export function tickResources(state: GameState): void {
  const production: Record<string, number> = {};
  const consumption: Record<string, number> = {};

  const isDay = state.isDay;
  const resourceRate = DIFFICULTY_MULTIPLIERS[state.difficulty].resourceRate;

  // ── Building production / consumption ─────────────────────────────────────
  for (const building of state.buildings) {
    if (building.status !== 'operational' || !building.powered) continue;
    const def = BUILDINGS[building.type];
    if (!def) continue;

    // Count assigned workers for this building.
    // Mine workers are assigned by task type (no explicit buildingId needed).
    // All other buildings require assignedBuildingId to match.
    let workers: number;
    if (building.type === 'mine_basic') {
      workers = state.crew.filter(c => c.isAlive && c.assignedTask === 'task_mine_basic').length;
    } else if (building.type === 'mine_advanced') {
      workers = state.crew.filter(c => c.isAlive && c.assignedTask === 'task_mine_adv').length;
    } else {
      workers = state.crew.filter(c => c.isAlive && c.assignedBuildingId === building.id).length;
    }

    const workerFactor = def.workers.max > 0
      ? Math.min(1, workers / Math.max(def.workers.min, 1))
      : 1;

    // Energy cost
    addTo(consumption, 'energy', def.energyCostPerTick);

    // Mine buildings: use selected miningResource instead of static production
    if ((building.type === 'mine_basic' || building.type === 'mine_advanced') && building.miningResource) {
      const rate = building.type === 'mine_basic' ? 8 / 30 : 15 / 30;
      addTo(production, building.miningResource, rate * workerFactor * resourceRate);
      for (const cons of def.consumption) {
        addTo(consumption, cons.resource, cons.perTick * workerFactor);
      }
      continue;
    }

    for (const prod of def.production) {
      let amount = prod.perTick * workerFactor;
      // Solar only during day
      if (building.type === 'solar_array') {
        amount = isDay ? amount : 0;
      }
      addTo(production, prod.resource, amount * resourceRate);
    }

    for (const cons of def.consumption) {
      addTo(consumption, cons.resource, cons.perTick * workerFactor);
    }
  }

  // ── Crew consumption ──────────────────────────────────────────────────────
  const aliveCrew = state.crew.filter(c => c.isAlive).length;
  const rationMult = state.rationLevel / 100;

  addTo(consumption, 'water',  aliveCrew * CREW_WATER_PER_TICK  * rationMult);
  addTo(consumption, 'food',   aliveCrew * CREW_FOOD_PER_TICK   * rationMult);
  addTo(consumption, 'oxygen', aliveCrew * CREW_OXYGEN_PER_TICK);

  // Store rates for UI
  state.resourceProduction  = production;
  state.resourceConsumption = consumption;

  // ── Apply net change ──────────────────────────────────────────────────────
  for (const [res, amount] of Object.entries(production)) {
    state.resources[res] = (state.resources[res] ?? 0) + amount;
  }
  for (const [res, amount] of Object.entries(consumption)) {
    state.resources[res] = Math.max(0, (state.resources[res] ?? 0) - amount);
  }

  // Clamp to storage capacity (non-critical resources)
  for (const key of Object.keys(state.resources)) {
    if (state.resources[key] > state.storageCapacity) {
      state.resources[key] = state.storageCapacity;
    }
  }
}

function addTo(map: Record<string, number>, key: string, val: number): void {
  map[key] = (map[key] ?? 0) + val;
}
