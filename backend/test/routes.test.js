const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const router = require('../dist/api/routes').default;
const { createInitialState } = require('../dist/engine/initialState');
const { setGameState, getGameState } = require('../dist/gameLoop');

async function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use('/api', router);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () => new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}

function withMockedRandom(sequence, fn) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = index < sequence.length ? sequence[index] : sequence[sequence.length - 1];
    index += 1;
    return value;
  };

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      Math.random = originalRandom;
    });
}

test('POST /api/action/assign-crew rejects malformed task ids', async () => {
  const state = createInitialState('normal');
  setGameState(state);
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/action/assign-crew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crewId: state.crew[0].id,
        taskId: 'bad_task',
        buildingId: null,
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /Invalid assign-crew payload/);
  } finally {
    await server.close();
  }
});

test('POST /api/action/set-mine-resource assigns valid mine targets', async () => {
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
  setGameState(state);
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/action/set-mine-resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buildingId: 'mine-1',
        resource: 'copper',
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(getGameState().buildings.find((building) => building.id === 'mine-1').miningResource, 'copper');
  } finally {
    await server.close();
  }
});

test('POST /api/action/dismantle refunds resources and unassigns workers', async () => {
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
  setGameState(state);
  const server = await createTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/action/dismantle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildingId: 'well-1' }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.refund, { iron_ore: 25, steel: 10 });
    assert.equal(getGameState().buildings.some((building) => building.id === 'well-1'), false);
    assert.equal(getGameState().crew[0].assignedTask, null);
    assert.equal(getGameState().crew[0].assignedBuildingId, null);
  } finally {
    await server.close();
  }
});

test('POST /api/action/scavenge-ship strips the ship on the final salvage run', async () => {
  const state = createInitialState('normal');
  const ship = state.buildings.find((building) => building.type === 'ship');
  state.shipScavengeCount = 3;
  state.crew[0].assignedTask = 'task_repair';
  state.crew[0].assignedBuildingId = ship.id;
  setGameState(state);
  const server = await createTestServer();

  try {
    await withMockedRandom([0, 0], async () => {
      const response = await fetch(`${server.baseUrl}/api/action/scavenge-ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.scavengeCount, 4);
      assert.equal(body.remaining, 0);
    });

    const updated = getGameState();
    assert.equal(updated.buildings.some((building) => building.type === 'ship'), false);
    assert.equal(updated.crew[0].assignedTask, null);
    assert.equal(updated.crew[0].assignedBuildingId, null);
    assert.match(updated.eventLog[0].message, /Ship scavenged/);
  } finally {
    await server.close();
  }
});
