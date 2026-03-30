import { Router, Request, Response } from 'express';
import { getGameState, setGameState } from '../gameLoop';
import { createInitialState } from '../engine/initialState';
import { saveState, loadState, listSaves } from '../db/database';
import { Difficulty, RationLevel, TaskId } from '../models/GameState';
import { TECHS, TechId } from '../config/techs';
import { RECIPES } from '../config/recipes';
import { BUILDINGS } from '../config/buildings';
import { RESOURCES } from '../config/resources';
import { startCrafting } from '../engine/craftingEngine';
import {
  assignCrewTask,
  assignCrewTasksBulk,
  beginResearch,
  dismantleBuilding,
  scavengeShip as scavengeShipAction,
  scoutTile as scoutTileAction,
  startBuild,
  setBuildingPower,
  setMineResource as setMineResourceAction,
} from '../services/gameActions';
import { migrateSaveState } from '../services/saveMigration';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const DIFFICULTIES: readonly Difficulty[] = ['easy', 'normal', 'hard', 'nightmare'];
const RATION_LEVELS: readonly RationLevel[] = [50, 75, 100, 125];
const BUILDING_TYPES = new Set(Object.keys(BUILDINGS));
const TECH_IDS = new Set(Object.keys(TECHS));
const RECIPE_IDS = new Set(RECIPES.map(r => r.id));

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

  const ok = assignCrewTask(state, crewId, taskId, buildingId ?? null);
  if (!ok) return res.status(404).json({ error: 'Crew member not found' });

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

  const normalizedAssignments: { crewId: string; taskId: TaskId | null; buildingId: string | null }[] = [];
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
    normalizedAssignments.push({ crewId, taskId, buildingId: buildingId ?? null });
  }

  assignCrewTasksBulk(state, normalizedAssignments);

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

  const result = startBuild(state, buildingType);
  if (!result.ok) {
    if (result.error === 'missing_tech') {
      return res.status(400).json({ error: `Missing prerequisite tech: ${result.details}` });
    }
    if (result.error === 'insufficient_resources') {
      return res.status(400).json({ error: 'Cannot build: insufficient resources' });
    }
    return res.status(400).json({ error: 'Cannot build: invalid building type' });
  }

  res.json({ ok: true, building: result.building });
});

router.post('/action/research', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const techId = readString(body?.['techId']);
  if (!techId || !TECH_IDS.has(techId)) {
    return res.status(400).json({ error: 'Invalid techId' });
  }

  const result = beginResearch(state, techId as TechId);
  if (!result.ok) return res.status(400).json({ error: 'Cannot research: prerequisites not met or already completed' });

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

  const result = setBuildingPower(state, buildingId, powered);
  if (!result.ok) return res.status(404).json({ error: 'Building not found' });

  res.json({ ok: true });
});

router.post('/action/set-mine-resource', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const body = isObject(req.body) ? req.body : null;
  const buildingId = readString(body?.['buildingId']);
  const resource = readString(body?.['resource']);
  if (!buildingId || !resource || !(resource in RESOURCES)) {
    return res.status(400).json({ error: 'Invalid set-mine-resource payload' });
  }

  const result = setMineResourceAction(state, buildingId, resource);
  if (!result.ok) {
    if (result.error === 'building_not_found') {
      return res.status(404).json({ error: 'Building not found' });
    }
    if (result.error === 'not_a_mine') {
      return res.status(400).json({ error: 'Target building is not a mine' });
    }
    return res.status(400).json({ error: 'Invalid set-mine-resource payload' });
  }

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

  const result = dismantleBuilding(state, buildingId);
  if (!result) return res.status(404).json({ error: 'Building not found' });

  res.json({ ok: true, refund: result.refund });
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

  const result = scoutTileAction(state, x, y);
  if (!result.ok) {
    if (result.error === 'out_of_bounds') {
      return res.status(400).json({ error: 'Scout coordinates out of bounds' });
    }
    return res.status(400).json({ error: 'No scouts assigned. Assign crew to the Scout task first.' });
  }

  res.json({ ok: true, newTiles: result.newTiles });
});

router.post('/action/scavenge-ship', (_req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const result = scavengeShipAction(state);
  if (!result) {
    return res.status(400).json({ error: 'The ship has been picked clean — nothing more to salvage.' });
  }

  res.json({ ok: true, ...result });
});

router.get('/config/recipes', (_req: Request, res: Response) => {
  res.json(RECIPES);
});

router.get('/config/buildings', (_req: Request, res: Response) => {
  res.json(BUILDINGS);
});

export default router;


