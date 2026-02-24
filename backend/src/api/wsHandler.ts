import WebSocket from 'ws';
import { GameState } from '../models/GameState';

const clients = new Set<WebSocket>();

export function registerClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
}

export function broadcastState(state: GameState): void {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', payload: state });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function broadcastMessage(type: string, payload: unknown): void {
  const msg = JSON.stringify({ type, payload });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

export function getClientCount(): number {
  return clients.size;
}
