const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { tickResources } = require('../dist/engine/resourceEngine');

test('tickResources applies mine output, building consumption, and crew upkeep', () => {
  const state = createInitialState('normal');

  state.crew = [
    {
      id: 'miner-1',
      name: 'Miner One',
      specialization: 'miner',
      secondarySkill1: null,
      secondarySkill2: null,
      health: 100,
      morale: 100,
      energy: 100,
      hunger: 100,
      thirst: 100,
      status: 'healthy',
      assignedTask: 'task_mine_basic',
      assignedBuildingId: null,
      isAlive: true,
    },
  ];

  state.buildings = [
    {
      id: 'mine-1',
      type: 'mine_basic',
      status: 'operational',
      constructionProgress: 100,
      condition: 100,
      powered: true,
      level: 1,
      miningResource: 'copper',
    },
  ];

  state.resources = {
    water: 10,
    food: 10,
    oxygen: 10,
    energy: 10,
    copper: 0,
  };

  tickResources(state);

  assert.equal(state.resources.copper, 8 / 30);
  assert.equal(state.resources.energy, 10 - 0.05);
  assert.equal(state.resources.water, 10 - (2 / 720));
  assert.equal(state.resources.food, 10 - (1 / 720));
  assert.equal(state.resources.oxygen, 10 - (1 / 720));
  assert.equal(state.resourceProduction.copper, 8 / 30);
  assert.equal(state.resourceConsumption.energy, 0.05);
});

test('tickResources disables solar output at night', () => {
  const state = createInitialState('normal');

  state.crew = [];
  state.isDay = false;
  state.buildings = [
    {
      id: 'solar-1',
      type: 'solar_array',
      status: 'operational',
      constructionProgress: 100,
      condition: 100,
      powered: true,
      level: 1,
    },
  ];
  state.resources = {
    energy: 5,
  };

  tickResources(state);

  assert.equal(state.resources.energy, 5);
  assert.equal(state.resourceProduction.energy ?? 0, 0);
});
