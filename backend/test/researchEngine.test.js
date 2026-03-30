const test = require('node:test');
const assert = require('node:assert/strict');

const { createInitialState } = require('../dist/engine/initialState');
const { startResearch, tickResearch } = require('../dist/engine/researchEngine');

function completeTech(state, techId) {
  const entry = state.research.find((research) => research.techId === techId);
  entry.status = 'completed';
  entry.progress = 100;
}

test('tickResearch completes active research and unlocks dependent techs', () => {
  const state = createInitialState('normal');
  const scientist = state.crew.find((crew) => crew.specialization === 'scientist');

  assert.ok(scientist);

  state.buildings.push({
    id: 'lab-1',
    type: 'research_lab',
    status: 'operational',
    constructionProgress: 100,
    condition: 100,
    powered: true,
    level: 1,
  });

  scientist.assignedTask = 'task_research';
  completeTech(state, 'basic_infrastructure');

  const started = startResearch(state, 'water_systems');
  assert.equal(started, true);

  for (let i = 0; i < 1000; i += 1) {
    tickResearch(state);
    if (state.activeResearchId === null) break;
  }

  const waterSystems = state.research.find((research) => research.techId === 'water_systems');
  const advancedWaterRecycling = state.research.find((research) => research.techId === 'advanced_water_recycling');

  assert.equal(state.activeResearchId, null);
  assert.equal(waterSystems.status, 'completed');
  assert.equal(waterSystems.progress, 100);
  assert.ok(state.researchPoints > 0);
  assert.equal(advancedWaterRecycling.status, 'available');
  assert.match(state.eventLog[0].message, /Research complete: Water Systems/);
});
