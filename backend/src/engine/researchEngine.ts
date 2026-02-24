import { GameState } from '../models/GameState';
import { TECHS, TechId } from '../config/techs';
import { BASE_RP_PER_TICK, SPEC_RP_PER_TICK } from '../config/balance';
import { v4 as uuidv4 } from 'uuid';

export function tickResearch(state: GameState): void {
  if (!state.activeResearchId) return;

  const hasLab = state.buildings.some(
    b => b.type === 'research_lab' && b.status === 'operational'
  );
  if (!hasLab) return;

  const scientists = state.crew.filter(
    c => c.isAlive && c.assignedTask === 'task_research'
  );
  if (scientists.length === 0) return;

  let rp = 0;
  for (const s of scientists) {
    rp += s.specialization === 'scientist' ? SPEC_RP_PER_TICK : BASE_RP_PER_TICK;
  }

  state.researchPoints += rp;

  const entry = state.research.find(r => r.techId === state.activeResearchId);
  if (!entry) return;

  const techDef = TECHS[state.activeResearchId];
  if (!techDef) return;

  const progressGain = (rp / techDef.cost) * 100;
  entry.progress = Math.min(100, entry.progress + progressGain);

  if (entry.progress >= 100) {
    entry.status = 'completed';
    state.activeResearchId = null;
    addLog(state, `Research complete: ${techDef.name}`, 'success');

    // Unlock dependent techs
    unlockAvailableTechs(state);
  }
}

export function startResearch(state: GameState, techId: TechId): boolean {
  const techDef = TECHS[techId];
  if (!techDef) return false;

  // Check prerequisites completed
  for (const prereq of techDef.prerequisites) {
    const prereqEntry = state.research.find(r => r.techId === prereq);
    if (!prereqEntry || prereqEntry.status !== 'completed') return false;
  }

  const entry = state.research.find(r => r.techId === techId);
  if (!entry || entry.status === 'completed') return false;

  entry.status = 'researching';
  state.activeResearchId = techId;
  return true;
}

export function unlockAvailableTechs(state: GameState): void {
  for (const entry of state.research) {
    if (entry.status !== 'locked') continue;
    const def = TECHS[entry.techId];
    if (!def) continue;
    const allPrereqsDone = def.prerequisites.every(prereq =>
      state.research.find(r => r.techId === prereq)?.status === 'completed'
    );
    if (allPrereqsDone) entry.status = 'available';
  }
}

function addLog(state: GameState, message: string, type: 'info'|'warning'|'danger'|'success'|'event'): void {
  state.eventLog.unshift({
    id: uuidv4(),
    tick: state.tick,
    message,
    type,
    resolved: true,
  });
  if (state.eventLog.length > 200) state.eventLog.pop();
}
