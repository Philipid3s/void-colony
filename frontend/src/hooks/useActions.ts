import { RationLevel, TaskId, Difficulty } from '../types/gameTypes';

const API = '/api';

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function useActions() {
  return {
    newGame: (difficulty: Difficulty) => post('/game/new', { difficulty }),
    saveGame: () => post('/game/save', {}),
    loadGame: (saveId: number) => post('/game/load', { saveId }),

    assignCrew: (crewId: string, taskId: TaskId | null, buildingId: string | null) =>
      post('/action/assign-crew', { crewId, taskId, buildingId }),

    assignCrewBulk: (assignments: { crewId: string; taskId: TaskId | null; buildingId: string | null }[]) =>
      post('/action/assign-crew-bulk', { assignments }),

    build: (buildingType: string) => post('/action/build', { buildingType }),

    research: (techId: string) => post('/action/research', { techId }),

    setRations: (level: RationLevel) => post('/action/set-rations', { level }),

    setPowered: (buildingId: string, powered: boolean) =>
      post('/action/set-energy', { buildingId, powered }),

    setMineResource: (buildingId: string, resource: string) =>
      post('/action/set-mine-resource', { buildingId, resource }),

    dismantle: (buildingId: string) => post('/action/dismantle', { buildingId }),

    scoutTile: (x: number, y: number) => post('/action/scout-tile', { x, y }),

    scavengeShip: () => post('/action/scavenge-ship', {}),
  };
}
