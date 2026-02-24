import Database from 'better-sqlite3';
import path from 'path';
import { GameState } from '../models/GameState';

let db: Database.Database;

export function getDb(): Database.Database {
  return db;
}

export function initDb(dbPath: string): void {
  db = new Database(path.resolve(dbPath));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createSchema();
  console.log(`[DB] Connected: ${dbPath}`);
}

function createSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_state (
      id       INTEGER PRIMARY KEY,
      data     TEXT NOT NULL,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function saveState(state: GameState): void {
  const json = JSON.stringify(state);
  const existing = db.prepare('SELECT id FROM game_state WHERE id = ?').get(state.id);
  if (existing) {
    db.prepare('UPDATE game_state SET data = ?, saved_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(json, state.id);
  } else {
    db.prepare('INSERT INTO game_state (id, data) VALUES (?, ?)').run(state.id, json);
  }
}

export function loadState(id: number): GameState | null {
  const row = db.prepare('SELECT data FROM game_state WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) as GameState : null;
}

export function listSaves(): { id: number; saved_at: string }[] {
  return db.prepare('SELECT id, saved_at FROM game_state ORDER BY saved_at DESC').all() as { id: number; saved_at: string }[];
}
