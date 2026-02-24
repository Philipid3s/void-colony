import { Router, Request, Response } from 'express';
import { getGameState, setGameState } from '../gameLoop';
import { createInitialState } from '../engine/initialState';
import { startConstruction } from '../engine/buildingEngine';
import { startResearch, unlockAvailableTechs } from '../engine/researchEngine';
import { saveState, loadState, listSaves } from '../db/database';
import { Difficulty, RationLevel, TaskId } from '../models/GameState';
import { TechId } from '../config/techs';
import { RECIPES } from '../config/recipes';
import { BUILDINGS } from '../config/buildings';
import { startCrafting } from '../engine/craftingEngine';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Game management ───────────────────────────────────────────────────────────
router.post('/game/new', (req: Request, res: Response) => {
  const difficulty: Difficulty = req.body.difficulty ?? 'normal';
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
  const { saveId } = req.body;
  const state = loadState(saveId ?? 1);
  if (!state) return res.status(404).json({ error: 'Save not found' });
  // Migrate old saves missing new fields
  if (!state.craftingJobs) state.craftingJobs = [];
  if (state.shipScavengeCount == null) state.shipScavengeCount = 0;
  if (!state.quests.some(q => q.questId === 'q_salvage_dawn')) {
    const scavengeCount = state.shipScavengeCount ?? 0;
    state.quests.unshift({
      questId: 'q_salvage_dawn',
      title: 'Salvage Dawn',
      description: 'The ship is wrecked, but its materials could save your colony. Strip it before the elements do.',
      status: scavengeCount >= 4 ? 'completed' : 'active',
      chapter: 1,
      objectives: [
        { id: uuidv4(), description: 'Scavenge the crashed ship (first run)', completed: scavengeCount >= 1 },
        { id: uuidv4(), description: 'Completely strip the ship (all 4 salvage runs)', completed: scavengeCount >= 4 },
      ],
    });
  }
  setGameState(state);
  res.json({ ok: true, state });
});

router.get('/game/saves', (_req: Request, res: Response) => {
  res.json(listSaves());
});

// ── Player actions ────────────────────────────────────────────────────────────
router.post('/action/assign-crew', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { crewId, taskId, buildingId } = req.body as { crewId: string; taskId: TaskId | null; buildingId: string | null };
  const crew = state.crew.find(c => c.id === crewId);
  if (!crew) return res.status(404).json({ error: 'Crew member not found' });

  crew.assignedTask = taskId;
  crew.assignedBuildingId = buildingId ?? null;

  res.json({ ok: true });
});

router.post('/action/assign-crew-bulk', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { assignments } = req.body as {
    assignments: { crewId: string; taskId: TaskId | null; buildingId: string | null }[]
  };

  for (const a of assignments) {
    const crew = state.crew.find(c => c.id === a.crewId);
    if (crew) {
      crew.assignedTask = a.taskId;
      crew.assignedBuildingId = a.buildingId ?? null;
    }
  }

  res.json({ ok: true });
});

router.post('/action/build', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { buildingType } = req.body as { buildingType: string };
  const building = startConstruction(state, buildingType);
  if (!building) return res.status(400).json({ error: 'Cannot build: insufficient resources or invalid type' });

  res.json({ ok: true, building });
});

router.post('/action/research', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { techId } = req.body as { techId: TechId };
  const ok = startResearch(state, techId);
  if (!ok) return res.status(400).json({ error: 'Cannot research: prerequisites not met or already completed' });

  res.json({ ok: true });
});

router.post('/action/set-rations', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { level } = req.body as { level: RationLevel };
  if (![50, 75, 100, 125].includes(level)) return res.status(400).json({ error: 'Invalid ration level' });
  state.rationLevel = level;

  res.json({ ok: true });
});

router.post('/action/set-energy', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { buildingId, powered } = req.body as { buildingId: string; powered: boolean };
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

  const { buildingId, resource } = req.body as { buildingId: string; resource: string };
  const building = state.buildings.find(b => b.id === buildingId);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  building.miningResource = resource as any;

  res.json({ ok: true });
});

router.post('/action/dismantle', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { buildingId } = req.body as { buildingId: string };
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

  const { recipeId, buildingId } = req.body as { recipeId: string; buildingId: string };
  const job = startCrafting(state, recipeId, buildingId);
  if (!job) return res.status(400).json({ error: 'Cannot craft: check resources, building, and recipe compatibility' });

  res.json({ ok: true, job });
});

router.post('/action/scout-tile', (req: Request, res: Response) => {
  const state = getGameState();
  if (!state) return res.status(404).json({ error: 'No active game' });

  const { x, y } = req.body as { x: number; y: number };
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
