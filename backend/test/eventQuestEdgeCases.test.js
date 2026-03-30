const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { tickEvents } = require('../dist/engine/eventEngine');
const { tickQuests } = require('../dist/engine/questEngine');

function withMockedRandom(sequence, fn) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = index < sequence.length ? sequence[index] : sequence[sequence.length - 1];
    index += 1;
    return value;
  };

  try {
    fn();
  } finally {
    Math.random = originalRandom;
  }
}

test('tickEvents does not duplicate an unresolved event of the same type', () => {
  const state = createInitialState('normal');

  state.activeEvents = [
    {
      id: 'evt-1',
      eventType: 'evt_dust_storm',
      startTick: 0,
      endTick: 999,
      severity: 'high',
      description: 'Dust storm approaching!',
      resolved: false,
    },
  ];

  withMockedRandom([0, 1, 1, 1, 1, 1, 1], () => {
    tickEvents(state);
  });

  const dustStorms = state.activeEvents.filter((event) => event.eventType === 'evt_dust_storm' && !event.resolved);
  assert.equal(dustStorms.length, 1);
});

test('tickEvents marks the game lost when all crew have died', () => {
  const state = createInitialState('normal');

  state.crew.forEach((crew) => {
    crew.isAlive = false;
    crew.health = 0;
  });

  withMockedRandom([1, 1, 1, 1, 1, 1, 1], () => {
    tickEvents(state);
  });

  assert.equal(state.status, 'lost');
  assert.match(state.eventLog[0].message, /All crew members have perished/);
});

test('tickQuests unlocks first light after the first ship scavenge', () => {
  const state = createInitialState('normal');
  const firstLight = state.quests.find((quest) => quest.questId === 'q_first_light');

  state.shipScavengeCount = 1;
  tickQuests(state);

  assert.equal(firstLight.status, 'active');
  assert.match(state.eventLog[0].message, /New quest unlocked: First Light/);
});

test('tickQuests completes first light and unlocks know your surroundings', () => {
  const state = createInitialState('normal');
  const firstLight = state.quests.find((quest) => quest.questId === 'q_first_light');
  const knowYourSurroundings = state.quests.find((quest) => quest.questId === 'q_know_surroundings');

  firstLight.status = 'active';
  state.crew[0].assignedTask = 'task_farm';
  state.crew[1].assignedTask = 'task_water';

  tickQuests(state);

  assert.equal(firstLight.status, 'completed');
  assert.equal(firstLight.objectives.every((objective) => objective.completed), true);
  assert.equal(knowYourSurroundings.status, 'active');
});
