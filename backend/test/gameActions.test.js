const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { assignCrewTask, setMineResource, dismantleBuilding, scavengeShip } = require('../dist/services/gameActions');

test('assignCrewTask updates a matching crew member', () => {
  const state = createInitialState('normal');
  const crewId = state.crew[0].id;

  const ok = assignCrewTask(state, crewId, 'task_water', 'well-1');

  assert.equal(ok, true);
  assert.equal(state.crew[0].assignedTask, 'task_water');
  assert.equal(state.crew[0].assignedBuildingId, 'well-1');
});

test('setMineResource rejects unsupported resources for a basic mine', () => {
  const state = createInitialState('normal');
  state.buildings.push({
    id: 'mine-1',
    type: 'mine_basic',
    status: 'operational',
    constructionProgress: 100,
    condition: 100,
    powered: true,
    level: 1,
  });

  const result = setMineResource(state, 'mine-1', 'uranium');

  assert.deepEqual(result, { ok: false, error: 'invalid_resource_for_mine' });
});

test('dismantleBuilding refunds cost and clears assigned crew', () => {
  const state = createInitialState('normal');
  state.resources.iron_ore = 0;
  state.resources.steel = 0;
  state.buildings.push({
    id: 'well-1',
    type: 'water_well',
    status: 'operational',
    constructionProgress: 100,
    condition: 100,
    powered: true,
    level: 1,
  });
  state.crew[0].assignedTask = 'task_water';
  state.crew[0].assignedBuildingId = 'well-1';

  const result = dismantleBuilding(state, 'well-1');

  assert.deepEqual(result, { refund: { iron_ore: 25, steel: 10 } });
  assert.equal(state.crew[0].assignedTask, null);
  assert.equal(state.buildings.some(building => building.id === 'well-1'), false);
});

test('scavengeShip removes the ship on the final salvage run', () => {
  const state = createInitialState('normal');
  const ship = state.buildings.find(building => building.type === 'ship');
  state.shipScavengeCount = 3;
  state.crew[0].assignedTask = 'task_repair';
  state.crew[0].assignedBuildingId = ship.id;

  const result = scavengeShip(state, () => 10);

  assert.equal(result.scavengeCount, 4);
  assert.equal(result.remaining, 0);
  assert.equal(state.buildings.some(building => building.type === 'ship'), false);
  assert.equal(state.crew[0].assignedTask, null);
});
