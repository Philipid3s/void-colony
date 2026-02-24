import { GameState, CraftingJob } from '../models/GameState';
import { RECIPES } from '../config/recipes';
import { v4 as uuidv4 } from 'uuid';

export function tickCrafting(state: GameState): void {
  for (const job of state.craftingJobs) {
    if (job.completed) continue;
    if (state.tick < job.endTick) continue;

    const recipe = RECIPES.find(r => r.id === job.recipeId);
    if (!recipe) { job.completed = true; continue; }

    // Deliver outputs
    for (const out of recipe.outputs) {
      state.resources[out.resource] = (state.resources[out.resource] ?? 0) + out.amount;
    }
    job.completed = true;

    addLog(state, `Crafting complete: ${recipe.name} (+${recipe.outputs.map(o => `${o.amount} ${o.resource.replace(/_/g,' ')}`).join(', ')})`, 'success');
  }

  // Remove completed jobs older than 50 ticks
  state.craftingJobs = state.craftingJobs.filter(j => !j.completed || (state.tick - j.endTick) < 50);
}

export function startCrafting(state: GameState, recipeId: string, buildingId: string): CraftingJob | null {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return null;

  // Check building exists and is operational
  const building = state.buildings.find(b => b.id === buildingId && b.status === 'operational');
  if (!building) return null;

  // Check building type is compatible
  if (!recipe.buildingTypes.includes(building.type)) return null;

  // Check resources
  for (const input of recipe.inputs) {
    if ((state.resources[input.resource] ?? 0) < input.amount) return null;
  }

  // Deduct inputs
  for (const input of recipe.inputs) {
    state.resources[input.resource] = (state.resources[input.resource] ?? 0) - input.amount;
  }

  const job: CraftingJob = {
    id: uuidv4(),
    recipeId,
    buildingId,
    startTick: state.tick,
    endTick: state.tick + recipe.timeTicks,
    completed: false,
  };

  state.craftingJobs.push(job);
  addLog(state, `Started crafting: ${recipe.name}`, 'info');
  return job;
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
