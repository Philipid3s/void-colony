import { v4 as uuidv4 } from 'uuid';

import { GameState, QuestEntry } from '../models/GameState';

function createSalvageDawnQuest(scavengeCount: number): QuestEntry {
  return {
    questId: 'q_salvage_dawn',
    title: 'Salvage Dawn',
    description: 'The ship is wrecked, but its materials could save your colony. Strip it before the elements do.',
    status: scavengeCount >= 4 ? 'completed' : 'active',
    chapter: 1,
    objectives: [
      { id: uuidv4(), description: 'Scavenge the crashed ship (first run)', completed: scavengeCount >= 1 },
      { id: uuidv4(), description: 'Completely strip the ship (all 4 salvage runs)', completed: scavengeCount >= 4 },
    ],
  };
}

export function migrateSaveState(state: GameState): GameState {
  if (!state.craftingJobs) {
    state.craftingJobs = [];
  }

  if (state.shipScavengeCount == null) {
    state.shipScavengeCount = 0;
  }

  if (!state.quests.some(q => q.questId === 'q_salvage_dawn')) {
    state.quests.unshift(createSalvageDawnQuest(state.shipScavengeCount));
  }

  return state;
}
