import { Router, Request, Response } from 'express';
import { getGameState, setGameState } from '../gameLoop';
import { createInitialState } from '../engine/initialState';
import { canStartConstruction, startConstruction } from '../engine/buildingEngine';
import { startResearch } from '../engine/researchEngine';
import { saveState, loadState, listSaves } from '../db/database';
import { Difficulty, RationLevel, TaskId } from '../models/GameState';
import { TECHS, TechId } from '../config/techs';
import { RECIPES } from '../config/recipes';
import { BUILDINGS } from '../config/buildings';
import { RESOURCES } from '../config/resources';
import { startCrafting } from '../engine/craftingEngine';
import { migrateSaveState } from '../services/saveMigration';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const DIFFICULTIES: readonly Difficulty[] = ['easy', 'normal', 'hard', 'nightmare'];
const RATION_LEVELS: readonly RationLevel[] = [50, 75, 100, 125];
const BUILDING_TYPES = new Set(Object.keys(BUILDINGS));
const TECH_IDS = new Set(Object.keys(TECHS));
const RESOURCE_IDS = new Set(Object.keys(RESOURCES));
const RECIPE_IDS = new Set(RECIPES.map(r => r.id));
const MINE_BASIC_RESOURCES = new Set(['iron_ore', 'coal', 'sand', 'clay', 'copper', 'aluminium', 'silicon', 'sulfur']);
const MINE_ADV_RESOURCES = new Set([...MINE_BASIC_RESOURCES, 'titanium', 'nickel', 'lithium', 'gold', 'rare_earth', 'uranium', 'helium3']);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return readString(value);
}

function readInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  return value;
}

function readBool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function isTaskIdValue(value: unknown): value is TaskId {
  return typeof value === 'string' && /^task_[a-z_]+$/.test(value);
}

// ── Game management ───────────────────────────────────────────────────────────
router.post('/game/new', (req: Request, res: Response) => {
  const body = isObject(req.body) ? req.body : {};
  const rawDifficulty = body['difficulty'];
  let difficulty: Difficulty = 'normal';
  if (rawDifficulty != null) {
    if (typeof rawDifficulty !== 'string' || !DIFFICULTIES.includes(rawDifficulty as Difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Use easy, normal, hard, or nightmare.' });
    }
    difficulty = rawDifficulty as Difficulty;
  }

  const state = createInitialState(difficulty);
  setGameState(state);
  saveState(state);
  res.json({ ok: true, state });
});

router.get('/game/state', (_req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });
  res.json(state);
});

router.post('/game/save', (_req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });
  saveState(state);
  res.json({ ok: true });
});

router.post('/game/load', (req: Request, res: Response) => {
  const body = isObject(req.body) ? req.body : {};
  const parsed = body['saveId'] == null ? 1 : readInt(body['saveId']);
  if (parsed == null || parsed < 1) {
    return res.status(400).json({ error: 'Invalid saveId. Must be a positive integer.' });
  }

  const state = loadState(parsed);
  if (!state) return res.status(404).json({ error: 'Save not found' });
  const migrated = migrateSaveState(state);
  setGameState(migrated);
  res.json({ ok: true, state: migrated });
});

router.get('/game/saves', (_req: Request, res: Response) => {
  res.json(listSaves());
});

// ── Player actions ────────────────────────────────────────────────────────────
router.post('/action/assign-crew', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  if (!body) return res.status(400).json({ error: 'Invalid request body' });

  const crewId = readString(body['crewId']);
  const rawTask = body['taskId'];
  const taskId: TaskId | null = rawTask === null
    ? null
    : (isTaskIdValue(rawTask) ? rawTask : null);
  const parsedBuildingId = readNullableString(body['buildingId']);
  const buildingId = parsedBuildingId === undefined ? null : parsedBuildingId;

  if (!crewId || (rawTask !== null && !isTaskIdValue(rawTask)) || parsedBuildingId === undefined) {
    return res.status(400).json({ error: 'Invalid assign-crew payload' });
  }

  const crew = state.crew.find(c => c.id === crewId);
  if (!crew) return res.status(404).json({ error: 'Crew member not found' });

  crew.assignedTask = taskId;
  crew.assignedBuildingId = buildingId ?? null;

  res.json({ ok: true });
});

router.post('/action/assign-crew-bulk', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const assignments = body?.['assignments'];
  if (!Array.isArray(assignments)) {
    return res.status(400).json({ error: 'Invalid assignments payload' });
  }
  if (assignments.length > 500) {
    return res.status(400).json({ error: 'Too many assignments in one request' });
  }

  for (const raw of assignments) {
    if (!isObject(raw)) continue;
    const crewId = readString(raw['crewId']);
    const rawTask = raw['taskId'];
    const taskId: TaskId | null = rawTask === null
      ? null
      : (isTaskIdValue(rawTask) ? rawTask : null);
    const parsedBuildingId = readNullableString(raw['buildingId']);
    const buildingId = parsedBuildingId === undefined ? null : parsedBuildingId;
    if (!crewId || (rawTask !== null && !isTaskIdValue(rawTask)) || parsedBuildingId === undefined) continue;

    const crew = state.crew.find(c => c.id === crewId);
    if (crew) {
      crew.assignedTask = taskId;
      crew.assignedBuildingId = buildingId ?? null;
    }
  }

  res.json({ ok: true });
});

router.post('/action/build', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const buildingType = readString(body?.['buildingType']);
  if (!buildingType || !BUILDING_TYPES.has(buildingType)) {
    return res.status(400).json({ error: 'Invalid buildingType' });
  }

  const check = canStartConstruction(state, buildingType);
  if (!check.ok) {
    if (check.reason === 'missing_tech') {
      return res.status(400).json({ error: `Missing prerequisite tech: ${check.details}` });
    }
    if (check.reason === 'insufficient_resources') {
      return res.status(400).json({ error: 'Cannot build: insufficient resources' });
    }
    return res.status(400).json({ error: 'Cannot build: invalid building type' });
  }

  const building = startConstruction(state, buildingType);
  if (!building) return res.status(400).json({ error: 'Cannot build' });

  res.json({ ok: true, building });
});

router.post('/action/research', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const techId = readString(body?.['techId']);
  if (!techId || !TECH_IDS.has(techId)) {
    return res.status(400).json({ error: 'Invalid techId' });
  }

  const ok = startResearch(state, techId as TechId);
  if (!ok) return res.status(400).json({ error: 'Cannot research: prerequisites not met or already completed' });

  res.json({ ok: true });
});

router.post('/action/set-rations', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const level = readInt(body?.['level']);
  if (level == null || !RATION_LEVELS.includes(level as RationLevel)) {
    return res.status(400).json({ error: 'Invalid ration level' });
  }
  state.rationLevel = level as RationLevel;

  res.json({ ok: true });
});

router.post('/action/set-energy', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const buildingId = readString(body?.['buildingId']);
  const powered = readBool(body?.['powered']);
  if (!buildingId || powered == null) {
    return res.status(400).json({ error: 'Invalid set-energy payload' });
  }

  const building = state.buildings.find(b => b.id === buildingId);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  building.powered = powered;

  // Unassign all crew from a building when it's powered off
  if (!powered) {
    for (const crew of state.crew) {
      if (crew.assignedBuildingId === buildingId) {
        crew.assignedTask = null;
        crew.assignedBuildingId = null;
      }
    }
  }

  res.json({ ok: true });
});

router.post('/action/set-mine-resource', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const buildingId = readString(body?.['buildingId']);
  const resource = readString(body?.['resource']);
  if (!buildingId || !resource || !RESOURCE_IDS.has(resource)) {
    return res.status(400).json({ error: 'Invalid set-mine-resource payload' });
  }

  const building = state.buildings.find(b => b.id === buildingId);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  if (building.type !== 'mine_basic' && building.type !== 'mine_advanced') {
    return res.status(400).json({ error: 'Target building is not a mine' });
  }

  const allowed = building.type === 'mine_basic' ? MINE_BASIC_RESOURCES : MINE_ADV_RESOURCES;
  if (!allowed.has(resource)) {
    return res.status(400).json({ error: `Resource ${resource} cannot be mined by ${building.type}` });
  }

  building.miningResource = resource as keyof typeof RESOURCES;

  res.json({ ok: true });
});

router.post('/action/dismantle', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const buildingId = readString(body?.['buildingId']);
  if (!buildingId) {
    return res.status(400).json({ error: 'Invalid buildingId' });
  }

  const idx = state.buildings.findIndex(b => b.id === buildingId);
  if (idx === -1) return res.status(404).json({ error: 'Building not found' });

  const building = state.buildings[idx];
  const def = BUILDINGS[building.type as keyof typeof BUILDINGS];

  // Calculate 50% resource refund from build cost
  // If still constructing, scale by construction progress
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

  // Unassign any workers
  for (const crew of state.crew) {
    if (crew.assignedBuildingId === buildingId) {
      crew.assignedTask = null;
      crew.assignedBuildingId = null;
    }
  }

  state.buildings.splice(idx, 1);
  res.json({ ok: true, refund });
});

router.post('/action/craft', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const recipeId = readString(body?.['recipeId']);
  const buildingId = readString(body?.['buildingId']);
  if (!recipeId || !RECIPE_IDS.has(recipeId) || !buildingId) {
    return res.status(400).json({ error: 'Invalid craft payload' });
  }

  const job = startCrafting(state, recipeId, buildingId);
  if (!job) return res.status(400).json({ error: 'Cannot craft: check resources, building, and recipe compatibility' });

  res.json({ ok: true, job });
});

router.post('/action/scout-tile', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const x = readInt(body?.['x']);
  const y = readInt(body?.['y']);
  if (x == null || y == null) {
    return res.status(400).json({ error: 'Invalid scout coordinates' });
  }
  if (y < 0 || y >= state.map.length || x < 0 || x >= state.map[0].length) {
    return res.status(400).json({ error: 'Scout coordinates out of bounds' });
  }

  const scouts = state.crew.filter(c => c.isAlive && c.assignedTask === 'task_scout');
  if (scouts.length === 0) {
    return res.status(400).json({ error: 'No scouts assigned. Assign crew to the Scout task first.' });
  }

  // Explore the target tile + ring of 1 around it
  let newTiles = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && ny < state.map.length && nx >= 0 && nx < state.map[0].length) {
        if (!state.map[ny][nx].explored) {
          state.map[ny][nx].explored = true;
          newTiles++;
        }
      }
    }
  }

  const msg = `Scout party sent to (${x},${y}) — ${newTiles} new tile${newTiles !== 1 ? 's' : ''} revealed.`;
  state.eventLog.unshift({ id: uuidv4(), tick: state.tick, message: msg, type: 'info', resolved: true });
  if (state.eventLog.length > 200) state.eventLog.pop();

  res.json({ ok: true, newTiles });
});

router.post('/action/scavenge-ship', (_req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const MAX_SCAVENGES = 4;
  if (state.shipScavengeCount >= MAX_SCAVENGES) {
    return res.status(400).json({ error: 'The ship has been picked clean — nothing more to salvage.' });
  }

  const round = state.shipScavengeCount + 1; // 1..4

  function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Diminishing hauls per round
  const hauls: Record<number, Array<{ resource: string; min: number; max: number }>> = {
    1: [
      { resource: 'iron_ore',    min: 70, max: 100 },
      { resource: 'steel',       min: 30, max:  50 },
      { resource: 'copper',      min: 15, max:  25 },
      { resource: 'coal',        min: 15, max:  25 },
      { resource: 'plastic',     min: 15, max:  25 },
      { resource: 'electronics', min:  8, max:  15 },
    ],
    2: [
      { resource: 'iron_ore',    min: 40, max:  65 },
      { resource: 'steel',       min: 15, max:  30 },
      { resource: 'copper',      min:  8, max:  18 },
      { resource: 'coal',        min:  8, max:  15 },
      { resource: 'plastic',     min:  8, max:  15 },
      { resource: 'electronics', min:  4, max:  10 },
    ],
    3: [
      { resource: 'iron_ore',    min: 20, max:  40 },
      { resource: 'steel',       min:  5, max:  15 },
      { resource: 'copper',      min:  5, max:  10 },
      { resource: 'plastic',     min:  3, max:   8 },
      { resource: 'electronics', min:  2, max:   5 },
    ],
    4: [
      { resource: 'iron_ore',    min: 10, max:  20 },
      { resource: 'coal',        min:  5, max:  10 },
    ],
  };

  const loot = hauls[round] ?? [];
  const gained: Record<string, number> = {};
  for (const entry of loot) {
    const amount = rnd(entry.min, entry.max);
    state.resources[entry.resource] = (state.resources[entry.resource] ?? 0) + amount;
    gained[entry.resource] = amount;
  }

  state.shipScavengeCount += 1;

  // Remove the wrecked ship once fully stripped
  if (state.shipScavengeCount >= MAX_SCAVENGES) {
    const shipIdx = state.buildings.findIndex(b => b.type === 'ship');
    if (shipIdx !== -1) {
      // Unassign any crew assigned to the ship
      const shipId = state.buildings[shipIdx].id;
      for (const crew of state.crew) {
        if (crew.assignedBuildingId === shipId) {
          crew.assignedTask = null;
          crew.assignedBuildingId = null;
        }
      }
      state.buildings.splice(shipIdx, 1);
    }
  }

  const lootSummary = Object.entries(gained)
    .map(([r, n]) => `${n} ${r.replace(/_/g, ' ')}`)
    .join(', ');
  const remainingRounds = MAX_SCAVENGES - state.shipScavengeCount;
  const roundSuffix = remainingRounds === 0
    ? 'The ship is now completely stripped.'
    : `(${remainingRounds} scavenge${remainingRounds !== 1 ? 's' : ''} remaining)`;

  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message: `Ship scavenged — recovered: ${lootSummary}. ${roundSuffix}`,
    type: 'success',
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();

  res.json({ ok: true, gained, scavengeCount: state.shipScavengeCount, remaining: remainingRounds });
});

router.get('/config/recipes', (_req: Request, res: Response) => {
  res.json(RECIPES);
});

router.get('/config/buildings', (_req: Request, res: Response) => {
  res.json(BUILDINGS);
});

export default router;
