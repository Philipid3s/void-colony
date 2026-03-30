const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const {
  assignCrewTask,
  assignCrewTasksBulk,
  beginResearch,
  scoutTile,
  scavengeShip,
  startBuild,
  setBuildingPower,
  setMineResource,
  dismantleBuilding,
} = require('../dist/services/gameActions');

test('assignCrewTask updates a matching crew member', () => {
  const state = createInitialState('normal');
  const crewId = state.crew[0].id;

  const ok = assignCrewTask(state, crewId, 'task_water', 'well-1');

  assert.equal(ok, true);
  assert.equal(state.crew[0].assignedTask, 'task_water');
  assert.equal(state.crew[0].assignedBuildingId, 'well-1');
});

test('assignCrewTasksBulk updates only matching crew members', () => {
  const state = createInitialState('normal');

  const updated = assignCrewTasksBulk(state, [
    { crewId: state.crew[0].id, taskId: 'task_water', buildingId: 'well-1' },
    { crewId: state.crew[1].id, taskId: 'task_farm', buildingId: null },
    { crewId: 'missing-crew', taskId: 'task_rest', buildingId: null },
  ]);

  assert.equal(updated, 2);
  assert.equal(state.crew[0].assignedTask, 'task_water');
  assert.equal(state.crew[1].assignedTask, 'task_farm');
});

test('startBuild returns missing tech when prerequisites are unmet', () => {
  const state = createInitialState('normal');

  const result = startBuild(state, 'research_lab');

  assert.deepEqual(result, { ok: false, error: 'missing_tech', details: 'basic_infrastructure' });
});

test('beginResearch starts available research', () => {
  const state = createInitialState('normal');

  const result = beginResearch(state, 'agriculture');

  assert.deepEqual(result, { ok: true });
  assert.equal(state.activeResearchId, 'agriculture');
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

test('setBuildingPower powers down a building and unassigns attached crew', () => {
  const state = createInitialState('normal');
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

  const result = setBuildingPower(state, 'well-1', false);

  assert.deepEqual(result, { ok: true });
  assert.equal(state.buildings.find(building => building.id === 'well-1').powered, false);
  assert.equal(state.crew[0].assignedTask, null);
  assert.equal(state.crew[0].assignedBuildingId, null);
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

test('scoutTile reveals surrounding tiles when scouts are assigned', () => {
  const state = createInitialState('normal');
  state.crew[0].assignedTask = 'task_scout';

  for (let ny = 8; ny <= 10; ny += 1) {
    for (let nx = 8; nx <= 10; nx += 1) {
      state.map[ny][nx].explored = false;
    }
  }

  const result = scoutTile(state, 9, 9);

  assert.deepEqual(result, { ok: true, newTiles: 9 });
  assert.equal(state.map[9][9].explored, true);
  assert.match(state.eventLog[0].message, /Scout party sent to/);
});
