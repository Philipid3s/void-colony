import { useEffect, useRef, useState } from 'react';
import { GameState, ServerMessage } from '../types/gameTypes';
import { WS_URL } from '../config/runtime';

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyed = useRef(false);

  useEffect(() => {
    destroyed.current = false;

    function connect(): void {
      if (destroyed.current) return;

      // Skip if already open or mid-handshake
      const rs = wsRef.current?.readyState;
      if (rs === WebSocket.OPEN || rs === WebSocket.CONNECTING) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyed.current) { ws.close(); return; }
        setConnected(true);
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      };

      ws.onmessage = (ev) => {
        try {
          const msg: ServerMessage = JSON.parse(ev.data as string);
          if (msg.type === 'STATE_UPDATE') setState(msg.payload);
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!destroyed.current) {
          timerRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      destroyed.current = true;
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      wsRef.current?.close();
    };
  }, []);

  return { state, connected };
}
