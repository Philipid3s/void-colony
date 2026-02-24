import { GameState } from './models/GameState';
import { tickResources } from './engine/resourceEngine';
import { tickCrew, tickScouting } from './engine/crewEngine';
import { tickBuildings } from './engine/buildingEngine';
import { tickResearch } from './engine/researchEngine';
import { tickEvents } from './engine/eventEngine';
import { tickQuests } from './engine/questEngine';
import { tickCrafting } from './engine/craftingEngine';
import { saveState } from './db/database';
import { TICKS_PER_DAY, DAY_TICKS } from './config/balance';

type BroadcastFn = (state: GameState) => void;

let gameState: GameState | null = null;
let loopInterval: ReturnType<typeof setInterval> | null = null;
let broadcastFn: BroadcastFn | null = null;

export function setGameState(state: GameState): void {
  gameState = state;
}

export function getGameState(): GameState | null {
  return gameState;
}

export function setBroadcast(fn: BroadcastFn): void {
  broadcastFn = fn;
}

export function startLoop(intervalMs: number): void {
  if (loopInterval) clearInterval(loopInterval);
  loopInterval = setInterval(tick, intervalMs);
  console.log(`[Loop] Started — tick every ${intervalMs}ms`);
}

export function stopLoop(): void {
  if (loopInterval) clearInterval(loopInterval);
  loopInterval = null;
}

function tick(): void {
  if (!gameState || gameState.status !== 'playing') return;

  gameState.tick++;
  gameState.updatedAt = Date.now();

  // Day/night cycle
  const dayPosition = gameState.tick % TICKS_PER_DAY;
  gameState.isDay = dayPosition < DAY_TICKS;

  // Run engine subsystems in order
  tickResources(gameState);
  tickCrew(gameState);
  tickBuildings(gameState);
  tickResearch(gameState);
  tickEvents(gameState);
  tickQuests(gameState);
  tickCrafting(gameState);
  tickScouting(gameState);

  // Persist every 30 ticks (1 game-hour)
  if (gameState.tick % 30 === 0) {
    saveState(gameState);
  }

  // Broadcast to all connected clients
  if (broadcastFn) broadcastFn(gameState);
}
