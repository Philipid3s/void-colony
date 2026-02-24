import { useState } from 'react';
import { GameState, TaskId } from '../../types/gameTypes';
import { getStatusColor } from '../../utils/formatters';
import { useActions } from '../../hooks/useActions';

interface Props { state: GameState; }

interface TaskDef { id: TaskId; label: string; emoji: string; requires?: string[] }

const TASKS: TaskDef[] = [
  { id: 'task_rest',        label: 'Rest',              emoji: '💤' },
  { id: 'task_build',       label: 'Build / Construct', emoji: '🔨' },
  { id: 'task_cook',        label: 'Cook Food',         emoji: '🍳', requires: ['cooking_station'] },
  { id: 'task_farm',        label: 'Farm',              emoji: '🌱', requires: ['hydroponics','insect_farm','algae_tank','mushroom_farm','seaweed_farm','bio_dome'] },
  { id: 'task_water',       label: 'Gather Water',      emoji: '💧', requires: ['water_well','atmo_condenser','water_purifier'] },
  { id: 'task_mine_basic',  label: 'Mine (Basic)',       emoji: '⛏',  requires: ['mine_basic'] },
  { id: 'task_mine_adv',    label: 'Mine (Advanced)',    emoji: '⛏',  requires: ['mine_advanced'] },
  { id: 'task_smelt',       label: 'Smelt / Foundry',   emoji: '🔥', requires: ['smelter'] },
  { id: 'task_manufacture', label: 'Manufacture',        emoji: '🏭', requires: ['workshop_adv','fab_plant'] },
  { id: 'task_research',    label: 'Research',           emoji: '🔬', requires: ['research_lab'] },
  { id: 'task_medical',     label: 'Treat Sick',         emoji: '💊', requires: ['infirmary','hospital'] },
  { id: 'task_repair',      label: 'Repair Equipment',   emoji: '🔧', requires: ['repair_station'] },
  { id: 'task_scout',       label: 'Scout / Explore',    emoji: '🗺' },
  { id: 'task_guard',       label: 'Guard',              emoji: '🛡' },
  { id: 'task_clean',       label: 'Clean & Maintain',   emoji: '🧹' },
];

function statBar(val: number, color: string) {
  return (
    <div className="w-12 bg-slate-800 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${val}%` }} />
    </div>
  );
}

export default function CrewManager({ state }: Props) {
  const actions = useActions();
  const [filter, setFilter] = useState<'all'|'idle'|'sick'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [alert, setAlert] = useState<string>('');

  // Include constructing buildings so crew can be assigned to build them
  const assignableBuildings = state.buildings.filter(
    b => b.status === 'operational' || b.status === 'constructing'
  );

  const filtered = state.crew.filter(c => {
    if (!c.isAlive) return false;
    if (filter === 'idle') return !c.assignedTask;
    if (filter === 'sick') return c.status === 'sick' || c.status === 'injured';
    return true;
  });

  // Pick the constructing building with fewest assigned builders
  const findConstructingBuilding = (): string | null => {
    const constructing = state.buildings.filter(b => b.status === 'constructing');
    if (constructing.length === 0) return null;
    if (constructing.length === 1) return constructing[0].id;
    return constructing
      .map(b => ({
        id: b.id,
        workers: state.crew.filter(
          c => c.isAlive && c.assignedTask === 'task_build' && c.assignedBuildingId === b.id
        ).length,
      }))
      .sort((a, b) => a.workers - b.workers)[0].id;
  };

  const checkBuildingRequired = (taskId: TaskId | null) => {
    if (!taskId) return;
    const def = TASKS.find(t => t.id === taskId);
    if (!def?.requires) return;
    const hasBuilding = def.requires.some(bt =>
      state.buildings.some(b => b.type === bt && b.status === 'operational')
    );
    if (!hasBuilding) {
      const names = def.requires.map(r => r.replace(/_/g, ' ')).join(' or ');
      setAlert(`⚠ No operational ${names} — build one first!`);
      setTimeout(() => setAlert(''), 4000);
    }
  };

  // Auto-resolve building for a task using the task's `requires` list.
  // Picks the operational building with fewest workers (load balancing).
  const resolveBuildingId = (taskId: TaskId | null): string | null => {
    if (!taskId) return null;
    if (taskId === 'task_build') return findConstructingBuilding();

    const taskDef = TASKS.find(t => t.id === taskId);
    if (!taskDef?.requires?.length) return selectedBuilding || null;

    const candidates = state.buildings.filter(
      b => taskDef.requires!.includes(b.type) && b.status === 'operational'
    );
    if (candidates.length === 0) return selectedBuilding || null;
    if (candidates.length === 1) return candidates[0].id;

    // Load balance: assign to the building with fewest workers
    return candidates
      .map(b => ({
        id: b.id,
        workers: state.crew.filter(c => c.isAlive && c.assignedBuildingId === b.id).length,
      }))
      .sort((a, b) => a.workers - b.workers)[0].id;
  };

  const assign = async (crewId: string, taskId: TaskId | null) => {
    checkBuildingRequired(taskId);
    await actions.assignCrew(crewId, taskId, resolveBuildingId(taskId));
  };

  const assignAll = async (taskId: TaskId) => {
    const idle = state.crew.filter(c => c.isAlive && !c.assignedTask);
    const buildingId = resolveBuildingId(taskId);
    await actions.assignCrewBulk(
      idle.map(c => ({ crewId: c.id, taskId, buildingId }))
    );
  };

  return (
    <div className="h-full flex flex-col">
      {alert && (
        <div className="mb-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">{alert}</div>
      )}
      {/* Toolbar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(['all','idle','sick'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-2 py-1 rounded border ${filter === f ? 'bg-blue-800 border-blue-500 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}>
            {f.toUpperCase()} ({f === 'all' ? state.crew.filter(c=>c.isAlive).length : f === 'idle' ? state.crew.filter(c=>c.isAlive&&!c.assignedTask).length : state.crew.filter(c=>c.isAlive&&(c.status==='sick'||c.status==='injured')).length})
          </button>
        ))}

        <select value={selectedBuilding} onChange={e => setSelectedBuilding(e.target.value)}
          className="text-xs bg-slate-800 border border-slate-600 text-slate-300 rounded px-2 py-1"
          title="Pin crew to a specific building for production tasks (auto for Build)">
          <option value="">Any building</option>
          {assignableBuildings.filter(b => b.status === 'operational').map(b => (
            <option key={b.id} value={b.id}>
              {b.type.replace(/_/g,' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk assign */}
      <div className="flex gap-1 mb-3 flex-wrap">
        <span className="text-xs text-slate-500 self-center mr-1">Bulk:</span>
        {TASKS.slice(1, 8).map(t => (
          <button key={t.id} onClick={() => assignAll(t.id)}
            className="text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Crew list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filtered.map(crew => (
          <div key={crew.id} className="bg-slate-800 rounded p-2 text-xs">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-white font-medium">{crew.name}</span>
                <span className="text-slate-400 ml-2 capitalize">[{crew.specialization}]</span>
                <span className={`ml-2 ${getStatusColor(crew.status)}`}>{crew.status}</span>
              </div>
              <select
                value={crew.assignedTask ?? ''}
                onChange={e => assign(crew.id, (e.target.value as TaskId) || null)}
                className="bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs px-1 py-0.5"
              >
                <option value="">Unassigned</option>
                {TASKS.map(t => (
                  <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex gap-1 items-center">❤ {statBar(crew.health, 'bg-red-500')}</div>
              <div className="flex gap-1 items-center">⚡ {statBar(crew.energy, 'bg-yellow-500')}</div>
              <div className="flex gap-1 items-center">😊 {statBar(crew.morale, 'bg-blue-500')}</div>
              <div className="flex gap-1 items-center">🍖 {statBar(crew.hunger, 'bg-green-600')}</div>
              <div className="flex gap-1 items-center">💧 {statBar(crew.thirst, 'bg-cyan-500')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
