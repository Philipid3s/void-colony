import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

import { initDb, loadState } from './db/database';
import { setGameState, startLoop, setBroadcast } from './gameLoop';
import { createInitialState } from './engine/initialState';
import { broadcastState, registerClient } from './api/wsHandler';
import apiRoutes from './api/routes';

const PORT            = parseInt(process.env['PORT'] ?? '3000', 10);
const DB_PATH         = process.env['DB_PATH'] ?? './void_colony.db';
const TICK_INTERVAL   = parseInt(process.env['TICK_INTERVAL_MS'] ?? '2000', 10);

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  registerClient(ws);

  // Send current state immediately on connect
  const { getGameState } = require('./gameLoop');
  const state = getGameState();
  if (state) ws.send(JSON.stringify({ type: 'STATE_UPDATE', payload: state }));
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // Init database
  initDb(DB_PATH);

  // Load existing save or create new game
  let state = loadState(1);
  if (!state) {
    console.log('[Game] No save found — starting new game (normal difficulty)');
    state = createInitialState('normal');
  } else {
    console.log(`[Game] Loaded save — tick ${state.tick}`);
    // Migrate old saves missing new fields
    if (!state.craftingJobs) state.craftingJobs = [];
    if (state.shipScavengeCount == null) state.shipScavengeCount = 0;
    if (!state.quests.some(q => q.questId === 'q_salvage_dawn')) {
      const { v4: uuidv4 } = require('uuid');
      const scavengeCount = state.shipScavengeCount ?? 0;
      state.quests.unshift({
        questId: 'q_salvage_dawn',
        title: 'Salvage Dawn',
        description: 'The ship is wrecked, but its materials could save your colony. Strip it before the elements do.',
        status: scavengeCount >= 4 ? 'completed' : 'active',
        chapter: 1,
        objectives: [
          { id: uuidv4(), description: 'Scavenge the crashed ship (first run)', completed: scavengeCount >= 1 },
          { id: uuidv4(), description: 'Completely strip the ship (all 4 salvage runs)', completed: scavengeCount >= 4 },
        ],
      });
    }
  }
  setGameState(state);

  // Wire up broadcast
  setBroadcast(broadcastState);

  // Start the game loop
  startLoop(TICK_INTERVAL);

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] WebSocket on ws://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
