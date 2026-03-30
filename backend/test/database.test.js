const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createInitialState } = require('../dist/engine/initialState');
const { initDb, saveState, loadState, listSaves, closeDb } = require('../dist/db/database');

const tmpDir = path.join(__dirname, 'tmp');

function getDbPath(name) {
  fs.mkdirSync(tmpDir, { recursive: true });
  return path.join(tmpDir, name);
}

function cleanupDbFiles(dbPath) {
  const candidates = [dbPath, `${dbPath}-shm`, `${dbPath}-wal`];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  }
}

test('database save/load round-trips game state', () => {
  const dbPath = getDbPath('roundtrip.sqlite');
  cleanupDbFiles(dbPath);

  try {
    initDb(dbPath);
    const state = createInitialState('normal');
    state.tick = 123;
    state.resources.water = 77;

    saveState(state);
    const loaded = loadState(state.id);

    assert.ok(loaded);
    assert.equal(loaded.tick, 123);
    assert.equal(loaded.resources.water, 77);
    assert.equal(loaded.crew.length, state.crew.length);
  } finally {
    closeDb();
    cleanupDbFiles(dbPath);
  }
});

test('database save updates an existing save entry', () => {
  const dbPath = getDbPath('update.sqlite');
  cleanupDbFiles(dbPath);

  try {
    initDb(dbPath);
    const state = createInitialState('normal');

    saveState(state);
    state.tick = 456;
    state.resources.food = 88;
    saveState(state);

    const loaded = loadState(state.id);
    const saves = listSaves();

    assert.equal(loaded.tick, 456);
    assert.equal(loaded.resources.food, 88);
    assert.equal(saves.length, 1);
    assert.equal(saves[0].id, state.id);
  } finally {
    closeDb();
    cleanupDbFiles(dbPath);
  }
});
