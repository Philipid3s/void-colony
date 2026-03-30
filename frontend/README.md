# Frontend

React 19 + Vite client for VOID COLONY.

## Responsibilities

- Connect to the backend over WebSocket and render the latest `GameState`
- Send player actions to the backend REST API
- Present management views for crew, buildings, crafting, research, quests, map, and event log

## Development

```bash
npm run dev --prefix frontend
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:3000`.

## Build

```bash
npm run build --prefix frontend
```

## Environment

Copy `frontend/.env.example` if you need the frontend to point at a non-default backend.

- `VITE_API_BASE_URL` sets the HTTP origin or base path used for REST calls
- `VITE_WS_URL` sets the WebSocket endpoint used for state sync

## Important integration detail

If these variables are not set, the frontend defaults to:
- `/api` for REST requests
- `/ws` on the current browser host for WebSocket connections
