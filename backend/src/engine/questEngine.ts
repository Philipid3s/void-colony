import { GameState, QuestEntry, QuestObjective } from '../models/GameState';
import { v4 as uuidv4 } from 'uuid';

export function tickQuests(state: GameState): void {
  for (const quest of state.quests) {
    if (quest.status !== 'active') continue;
    updateQuestProgress(state, quest);
  }

  // Unlock quests when triggers are met
  checkQuestUnlocks(state);
}

function updateQuestProgress(state: GameState, quest: QuestEntry): void {
  switch (quest.questId) {
    case 'q_salvage_dawn':
      checkSalvageDawn(state, quest);
      break;
    case 'q_first_light':
      checkFirstLight(state, quest);
      break;
    case 'q_know_surroundings':
      // Completed by player scouting action
      break;
    case 'q_under_the_stars':
      checkUnderTheStars(state, quest);
      break;
    case 'q_breaking_ground':
      checkBreakingGround(state, quest);
      break;
    case 'q_power_up':
      checkPowerUp(state, quest);
      break;
    case 'q_broken_voice':
      checkBrokenVoice(state, quest);
      break;
  }
}

function checkSalvageDawn(state: GameState, quest: QuestEntry): void {
  const count = state.shipScavengeCount ?? 0;
  if (count >= 1) completeObjective(quest.objectives[0]);
  if (count >= 4) completeObjective(quest.objectives[1]);
  if (quest.objectives.every(o => o.completed)) completeQuest(state, quest);
}

function checkFirstLight(state: GameState, quest: QuestEntry): void {
  const obj = quest.objectives;
  const hasFoodWorker  = state.crew.some(c => c.isAlive && (c.assignedTask === 'task_farm' || c.assignedTask === 'task_insects'));
  const hasWaterWorker = state.crew.some(c => c.isAlive && c.assignedTask === 'task_water');
  if (hasFoodWorker)  completeObjective(obj[0]);
  if (hasWaterWorker) completeObjective(obj[1]);

  if (obj.every(o => o.completed)) completeQuest(state, quest);
}

function checkUnderTheStars(state: GameState, quest: QuestEntry): void {
  const foodReserve  = (state.resources['food']  ?? 0) >= 100;
  const waterReserve = (state.resources['water'] ?? 0) >= 100;
  if (foodReserve)  completeObjective(quest.objectives[0]);
  if (waterReserve) completeObjective(quest.objectives[1]);
  if (quest.objectives.every(o => o.completed)) completeQuest(state, quest);
}

function checkBreakingGround(state: GameState, quest: QuestEntry): void {
  const hasMine = state.buildings.some(b => b.type === 'mine_basic' && b.status === 'operational');
  if (hasMine) completeObjective(quest.objectives[0]);
  if ((state.resources['iron_ore'] ?? 0) >= 100) completeObjective(quest.objectives[1]);
  if (quest.objectives.every(o => o.completed)) completeQuest(state, quest);
}

function checkPowerUp(state: GameState, quest: QuestEntry): void {
  const hasPower = state.buildings.some(
    b => (b.type === 'solar_array' || b.type === 'geothermal') && b.status === 'operational'
  );
  if (hasPower) {
    completeObjective(quest.objectives[0]);
    completeQuest(state, quest);
  }
}

function checkBrokenVoice(state: GameState, quest: QuestEntry): void {
  const hasTechnician = state.crew.some(c => c.isAlive && c.specialization === 'technician');
  if (hasTechnician) completeObjective(quest.objectives[0]);
  if (quest.objectives[0].completed) completeObjective(quest.objectives[1]);
  if (quest.objectives.every(o => o.completed)) completeQuest(state, quest);
}

function checkQuestUnlocks(state: GameState): void {
  const completed = new Set(state.quests.filter(q => q.status === 'completed').map(q => q.questId));

  for (const quest of state.quests) {
    if (quest.status !== 'locked') continue;

    let shouldUnlock = false;
    switch (quest.questId) {
      // q_salvage_dawn starts active — no unlock needed
      case 'q_first_light':
        // Unlocks after the first scavenge — player now has resources to assign tasks
        shouldUnlock = (state.shipScavengeCount ?? 0) >= 1;
        break;
      case 'q_know_surroundings': shouldUnlock = completed.has('q_first_light'); break;
      case 'q_under_the_stars':   shouldUnlock = state.tick >= 30 * 24 * 2; break; // Day 2
      case 'q_breaking_ground':   shouldUnlock = completed.has('q_under_the_stars'); break;
      case 'q_power_up':          shouldUnlock = completed.has('q_breaking_ground'); break;
      case 'q_broken_voice': {
        const hasLab = state.buildings.some(b => b.type === 'research_lab' && b.status === 'operational');
        shouldUnlock = hasLab || state.tick >= 30 * 24 * 7;
        break;
      }
    }

    if (shouldUnlock) {
      quest.status = 'active';
      addLog(state, `New quest unlocked: ${quest.title}`, 'event');
    }
  }
}

function completeObjective(obj: QuestObjective): void {
  obj.completed = true;
}

function completeQuest(state: GameState, quest: QuestEntry): void {
  quest.status = 'completed';
  addLog(state, `Quest completed: ${quest.title}!`, 'success');
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
