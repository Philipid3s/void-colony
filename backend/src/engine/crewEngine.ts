import { GameState, CrewMember, CrewStatus } from '../models/GameState';
import {
  CREW_ENERGY_WORK_DRAIN, CREW_ENERGY_REST_REGEN,
  CREW_HUNGER_DRAIN, CREW_THIRST_DRAIN,
  MORALE_ADEQUATE_FOOD_BONUS, MORALE_ADEQUATE_WATER_BONUS,
  MORALE_RATION_50_PENALTY, MORALE_RATION_75_PENALTY, MORALE_RATION_125_BONUS,
  MORALE_CREW_DEATH_PENALTY,
  DIFFICULTY_MULTIPLIERS,
} from '../config/balance';

export function tickCrew(state: GameState): void {
  const difficulty = DIFFICULTY_MULTIPLIERS[state.difficulty];
  const resilience = difficulty.crewResilience;
  const hardship = 1 / Math.max(resilience, 0.01);

  let totalMorale = 0;
  let aliveCount  = 0;

  for (const crew of state.crew) {
    if (!crew.isAlive) continue;

    // Energy / fatigue
    if (crew.assignedTask === 'task_rest' || crew.assignedTask === null) {
      crew.energy = Math.min(100, crew.energy + CREW_ENERGY_REST_REGEN * resilience);
    } else {
      crew.energy = Math.max(0, crew.energy - CREW_ENERGY_WORK_DRAIN * hardship);
    }

    // Hunger / thirst
    crew.hunger = Math.max(0, crew.hunger - CREW_HUNGER_DRAIN * hardship);
    crew.thirst = Math.max(0, crew.thirst - CREW_THIRST_DRAIN * hardship);

    // Restore from available food/water (resources were consumed globally in resourceEngine)
    const rationMult = state.rationLevel / 100;
    if (state.resources['food'] > 0) {
      crew.hunger = Math.min(100, crew.hunger + ((100 * rationMult) / 720) * resilience);
    }
    if (state.resources['water'] > 0) {
      crew.thirst = Math.min(100, crew.thirst + ((100 * rationMult) / 720) * resilience);
    }

    // Morale adjustments
    if (crew.hunger > 50) crew.morale = Math.min(100, crew.morale + MORALE_ADEQUATE_FOOD_BONUS * resilience);
    if (crew.thirst > 50) crew.morale = Math.min(100, crew.morale + MORALE_ADEQUATE_WATER_BONUS * resilience);

    if (state.rationLevel === 50)  crew.morale = Math.max(0, crew.morale - MORALE_RATION_50_PENALTY * hardship);
    if (state.rationLevel === 75)  crew.morale = Math.max(0, crew.morale - MORALE_RATION_75_PENALTY * hardship);
    if (state.rationLevel === 125) crew.morale = Math.min(100, crew.morale + MORALE_RATION_125_BONUS * resilience);

    // Health damage from critical conditions
    if (crew.hunger < 10) crew.health = Math.max(0, crew.health - (0.5 / 720) * hardship);
    if (crew.thirst < 20) crew.health = Math.max(0, crew.health - (1.0 / 720) * hardship);
    if (crew.energy < 10) crew.health = Math.max(0, crew.health - (0.2 / 720) * hardship);
    if (crew.morale < 20) crew.morale = Math.max(0, crew.morale - (0.5 / 720) * hardship);

    // Update status
    crew.status = deriveStatus(crew);

    // Death check
    if (crew.health <= 0) {
      crew.isAlive = false;
      crew.health = 0;

      // Apply one-time morale hit when a death happens.
      const deathMoraleHit = MORALE_CREW_DEATH_PENALTY * hardship;
      for (const other of state.crew) {
        if (other.isAlive) {
          other.morale = Math.max(0, other.morale - deathMoraleHit);
        }
      }

      addLog(state, `${crew.name} has died.`, 'danger');
      continue;
    }

    aliveCount++;
    totalMorale += crew.morale;
  }

  state.globalMorale = aliveCount > 0 ? totalMorale / aliveCount : 0;
}

function deriveStatus(c: CrewMember): CrewStatus {
  if (c.status === 'sick')               return 'sick';
  if (c.status === 'injured')            return 'injured';
  if (c.status === 'radiation_sickness') return 'radiation_sickness';
  if (c.thirst < 20)  return 'dehydrated';
  if (c.hunger < 10)  return 'starving';
  if (c.hunger < 30)  return 'hungry';
  if (c.energy < 10)  return 'exhausted';
  if (c.energy < 30)  return 'tired';
  if (c.morale < 20)  return 'depressed';
  if (c.morale > 90)  return 'inspired';
  return 'healthy';
}

// Auto-scouting: crew assigned task_scout explore frontier tiles each game-hour
export function tickScouting(state: GameState): void {
  if (state.tick % 30 !== 0) return; // once per game-hour

  const scouts = state.crew.filter(c => c.isAlive && c.assignedTask === 'task_scout');
  if (scouts.length === 0) return;

  // Collect frontier: unexplored tiles adjacent to explored ones
  const frontier: { x: number; y: number }[] = [];
  for (let y = 0; y < state.map.length; y++) {
    for (let x = 0; x < state.map[y].length; x++) {
      if (state.map[y][x].explored) continue;
      const adjacent = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dy, dx]) => {
        const ny = y + dy, nx = x + dx;
        return ny >= 0 && ny < state.map.length && nx >= 0 && nx < state.map[ny].length
          && state.map[ny][nx].explored;
      });
      if (adjacent) frontier.push({ x, y });
    }
  }

  if (frontier.length === 0) return;

  // Each scout explores one frontier tile (random selection)
  const explored: Set<string> = new Set();
  for (let i = 0; i < scouts.length && frontier.length > 0; i++) {
    const idx = Math.floor(Math.random() * frontier.length);
    const tile = frontier.splice(idx, 1)[0];
    const key = `${tile.x},${tile.y}`;
    if (!explored.has(key)) {
      state.map[tile.y][tile.x].explored = true;
      explored.add(key);
    }
  }

  if (explored.size > 0) {
    addLog(state, `Scouts explored ${explored.size} new area${explored.size > 1 ? 's' : ''}.`, 'info');
  }
}

function addLog(state: GameState, message: string, type: 'info'|'warning'|'danger'|'success'|'event'): void {
  const { v4: uuidv4 } = require('uuid');
  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message,
    type,
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();
}
