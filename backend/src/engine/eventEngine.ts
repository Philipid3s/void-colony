import { GameState, ActiveEvent } from '../models/GameState';
import { DIFFICULTY_MULTIPLIERS } from '../config/balance';
import { v4 as uuidv4 } from 'uuid';

// Probability weights per event per tick (adjust for frequency)
const EVENT_WEIGHTS: Record<string, number> = {
  evt_dust_storm:    0.0002,
  evt_accident:      0.0003,
  evt_malfunction:   0.0004,
  evt_crew_conflict: 0.0002,
  evt_disease:       0.0001,
  evt_aurora:        0.0001,
  evt_deposit:       0.0002,
};

export function tickEvents(state: GameState): void {
  const tick = state.tick;
  const eventFreq = DIFFICULTY_MULTIPLIERS[state.difficulty].eventFreq;

  // Resolve expired active events
  for (const evt of state.activeEvents) {
    if (!evt.resolved && tick >= evt.endTick) {
      evt.resolved = true;
      addLog(state, `Event ended: ${evt.description}`, 'info');
    }
  }

  // Random event roll
  for (const [evtType, weight] of Object.entries(EVENT_WEIGHTS)) {
    if (Math.random() < Math.min(1, weight * eventFreq)) {
      triggerEvent(state, evtType);
    }
  }

  // Check win/lose
  checkWinLose(state);
}

function triggerEvent(state: GameState, evtType: string): void {
  // Deduplicate: don't trigger same event if already active
  if (state.activeEvents.some(e => e.eventType === evtType && !e.resolved)) return;

  let description = '';
  let endTick = state.tick + 30 * 6; // default 6 game-hours
  let severity: ActiveEvent['severity'] = 'medium';

  switch (evtType) {
    case 'evt_dust_storm':
      description = 'Dust storm approaching! Outdoor workers halted. Solar at -80%.';
      endTick = state.tick + 30 * (6 + Math.floor(Math.random() * 18)); // 6-24h
      severity = 'high';
      break;
    case 'evt_accident':
      description = 'Workplace accident! A crew member is injured.';
      severity = 'medium';
      endTick = state.tick + 1;
      injureRandomCrew(state);
      break;
    case 'evt_malfunction':
      description = 'Equipment malfunction! A building is at reduced efficiency.';
      severity = 'low';
      endTick = state.tick + 30 * 4;
      malfunctionBuilding(state);
      break;
    case 'evt_crew_conflict':
      description = 'Crew conflict! A fight breaks out, morale drops.';
      severity = 'medium';
      endTick = state.tick + 1;
      applyMoraleHit(state, -5);
      break;
    case 'evt_disease':
      description = 'Disease outbreak detected! Crew members falling sick.';
      severity = 'high';
      endTick = state.tick + 30 * 24;
      sickenRandomCrew(state, 3);
      break;
    case 'evt_aurora':
      description = 'Beautiful aurora lights up the sky! Crew morale boost.';
      severity = 'low';
      endTick = state.tick + 30 * 6;
      applyMoraleHit(state, 10);
      break;
    case 'evt_deposit':
      description = 'Scouts discovered a new resource deposit nearby!';
      severity = 'low';
      endTick = state.tick + 1;
      break;
    default:
      description = `Unknown event: ${evtType}`;
  }

  const active: ActiveEvent = {
    id: uuidv4(),
    eventType: evtType,
    startTick: state.tick,
    endTick,
    severity,
    description,
    resolved: endTick <= state.tick,
  };

  state.activeEvents.push(active);
  const logType = (['high','critical'] as ActiveEvent['severity'][]).includes(severity) ? 'danger' : 'event';
  addLog(state, description, logType);
}

function injureRandomCrew(state: GameState): void {
  const candidates = state.crew.filter(c => c.isAlive && c.status === 'healthy');
  if (candidates.length === 0) return;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  target.status = 'injured';
  target.health = Math.max(10, target.health - 30);
}

function sickenRandomCrew(state: GameState, count: number): void {
  const candidates = state.crew.filter(c => c.isAlive && c.status === 'healthy');
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    const idx = Math.floor(Math.random() * candidates.length);
    candidates[idx].status = 'sick';
    candidates.splice(idx, 1);
  }
}

function malfunctionBuilding(state: GameState): void {
  const operational = state.buildings.filter(b => b.status === 'operational');
  if (operational.length === 0) return;
  const target = operational[Math.floor(Math.random() * operational.length)];
  target.condition = Math.max(20, target.condition - 40);
}

function applyMoraleHit(state: GameState, delta: number): void {
  for (const crew of state.crew) {
    if (crew.isAlive) crew.morale = Math.max(0, Math.min(100, crew.morale + delta));
  }
}

function checkWinLose(state: GameState): void {
  const alive = state.crew.filter(c => c.isAlive).length;
  if (alive === 0) {
    state.status = 'lost';
    addLog(state, 'All crew members have perished. Colony lost.', 'danger');
    return;
  }
  if (state.globalMorale <= 0) {
    state.status = 'lost';
    addLog(state, 'Crew morale has collapsed. Mutiny - game over.', 'danger');
    return;
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
