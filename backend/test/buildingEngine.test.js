const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { canStartConstruction, startConstruction } = require('../dist/engine/buildingEngine');

test('canStartConstruction blocks buildings behind unmet prerequisite tech', () => {
  const state = createInitialState('normal');

  const result = canStartConstruction(state, 'research_lab');

  assert.deepEqual(result, {
    ok: false,
    reason: 'missing_tech',
    details: 'basic_infrastructure',
  });
});

test('startConstruction deducts cost and creates a new building instance', () => {
  const state = createInitialState('normal');
  state.resources.iron_ore = 500;
  state.resources.steel = 100;

  const beforeIronOre = state.resources.iron_ore;
  const beforeSteel = state.resources.steel;
  const beforeCount = state.buildings.length;

  const building = startConstruction(state, 'water_well');

  assert.ok(building);
  assert.equal(state.buildings.length, beforeCount + 1);
  assert.equal(building.type, 'water_well');
  assert.equal(building.status, 'constructing');
  assert.equal(state.resources.iron_ore, beforeIronOre - 50);
  assert.equal(state.resources.steel, beforeSteel - 20);
  assert.match(state.eventLog[0].message, /Started construction: Water Well/);
});
