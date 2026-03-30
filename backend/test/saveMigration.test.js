const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { migrateSaveState } = require('../dist/services/saveMigration');

test('migrateSaveState adds missing legacy fields and salvage quest', () => {
  const state = createInitialState('normal');

  state.craftingJobs = undefined;
  state.shipScavengeCount = undefined;
  state.quests = state.quests.filter((quest) => quest.questId !== 'q_salvage_dawn');

  const migrated = migrateSaveState(state);
  const salvageQuest = migrated.quests.find((quest) => quest.questId === 'q_salvage_dawn');

  assert.ok(Array.isArray(migrated.craftingJobs));
  assert.equal(migrated.shipScavengeCount, 0);
  assert.ok(salvageQuest);
  assert.equal(salvageQuest.status, 'active');
  assert.equal(salvageQuest.objectives.length, 2);
  assert.equal(salvageQuest.objectives[0].completed, false);
});

test('migrateSaveState is idempotent for salvage quest creation', () => {
  const state = createInitialState('normal');
  state.shipScavengeCount = 4;
  state.quests = state.quests.filter((quest) => quest.questId !== 'q_salvage_dawn');

  migrateSaveState(state);
  migrateSaveState(state);

  const salvageQuests = state.quests.filter((quest) => quest.questId === 'q_salvage_dawn');

  assert.equal(salvageQuests.length, 1);
  assert.equal(salvageQuests[0].status, 'completed');
  assert.equal(salvageQuests[0].objectives[0].completed, true);
  assert.equal(salvageQuests[0].objectives[1].completed, true);
});
