# VOID COLONY

> *50 survivors. One crashed ship. One mission.*

A real-time browser-based colony management and survival game. Your spaceship has crash-landed on a remote planet. Manage your crew, scavenge resources, build infrastructure, and find a way home — or build a colony that never needs to leave.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + TypeScript (CommonJS), Express, `ws` (WebSocket), `better-sqlite3` |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Database | SQLite (via `better-sqlite3`) |
| Communication | REST API + WebSocket (real-time state sync) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/space-outpost.git
cd space-outpost

# Install all dependencies (root + backend + frontend)
npm install
npm install --prefix backend
npm install --prefix frontend

# Start development (backend + frontend concurrently)
npm run dev
```

- **Backend** runs on `http://localhost:3000`
- **Frontend** runs on `http://localhost:5173`

### Production Build

```bash
npm run build
# Then start backend
npm run start:backend
```

---

## Project Structure

```
space-outpost/
├── backend/
│   ├── src/
│   │   ├── api/          # Express routes + WebSocket handler
│   │   ├── config/       # Game data (buildings, resources, recipes, tech tree, balance)
│   │   ├── db/           # SQLite database layer
│   │   ├── engine/       # Game loop engines (resources, crew, buildings, events, quests...)
│   │   ├── models/       # TypeScript interfaces (GameState, CrewMember, etc.)
│   │   └── server.ts     # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React UI components (tabs, panels, sidebar)
│   │   ├── hooks/        # useGameState (WebSocket), useActions (API calls)
│   │   ├── types/        # Shared TypeScript types
│   │   └── utils/        # Formatters, helpers
│   └── package.json
├── specs/
│   └── VOID_COLONY_GDD.md   # Full Game Design Document
└── package.json             # Root workspace (runs both services)
```

---

## Gameplay

### Core Loop

1. **Scavenge** the crashed ship for starting materials (4 salvage runs, diminishing returns)
2. **Assign crew** to survival tasks — water collection, food production, oxygen generation
3. **Build** structures to automate production and expand capacity
4. **Research** technologies to unlock advanced buildings and recipes
5. **Explore** the map to find resource deposits and alien artifacts
6. **Repair** the radio transmitter and signal for rescue — or build a self-sustaining colony

### Time System

| Real Time | Game Time |
|-----------|-----------|
| 1 minute | 1 game hour |
| 24 minutes | 1 game day |
| ~2h 48min | 1 game week |

### Win Conditions

- **Primary** — Repair the radio and contact the rescue fleet
- **Secondary** — Build a fully self-sustaining colony
- **Secret** — Discover the planet's hidden secret through exploration

### Difficulty

| Mode | Resources | Events | Crew Resilience |
|------|-----------|--------|-----------------|
| Easy | ×1.5 | ×0.5 | ×1.5 |
| Normal | ×1.0 | ×1.0 | ×1.0 |
| Hard | ×0.7 | ×1.5 | ×0.7 |
| Nightmare | ×0.5 | ×2.0 | ×0.5 |

---

## Key Features

- **Real-time simulation** — the colony runs every 2 seconds whether you're watching or not
- **Auto-save** — state is persisted to SQLite on an interval
- **Day/Night cycle** — solar power only works during the day; crew fatigue and morale shift with the cycle
- **Crew specializations** — engineer, miner, scientist, farmer, doctor, pilot, security, cook, technician, leader
- **Tech tree** — research unlocks advanced buildings, crafting recipes, and capabilities
- **Event system** — random events (storms, illness, equipment failures) require player decisions
- **Crafting** — combine raw materials into processed goods (steel, electronics, medicine, etc.)
- **Full resource economy** — 40+ resources across life support, metals, non-metals, and processed goods

---

## License

MIT
