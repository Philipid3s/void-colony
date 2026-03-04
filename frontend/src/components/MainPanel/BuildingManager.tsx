import { useState, useEffect } from 'react';
import { GameState } from '../../types/gameTypes';
import { useActions } from '../../hooks/useActions';
import { formatNumber, getResourceIcon } from '../../utils/formatters';

const MINE_BASIC_RESOURCES = ['iron_ore','coal','sand','clay','copper','aluminium','silicon','sulfur'];
const MINE_ADV_RESOURCES   = [...MINE_BASIC_RESOURCES,'titanium','nickel','lithium','gold','rare_earth','uranium','helium3'];

interface BuildingCost { resource: string; amount: number; }
interface BuildingDef {
  id: string;
  name: string;
  tier: number;
  cost: BuildingCost[];
  buildTimeTicks: number;
  workers: { min: number; max: number };
  description: string;
  prereqTech?: string;
}

function buildTime(ticks: number): string {
  const hours = ticks / 30;
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(0)}h`;
}

const STARTING_BUILDINGS = new Set([
  'ship','quarters_basic','cooking_station','warehouse_small','repair_station','radio_broken',
]);

const TIER_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Tier 1 — Basic',     color: 'text-green-400'  },
  2: { label: 'Tier 2 — Advanced',  color: 'text-yellow-400' },
  3: { label: 'Tier 3 — High-Tech', color: 'text-orange-400' },
  4: { label: 'Tier 4 — Endgame',   color: 'text-red-400'    },
};

const MAX_SHIP_SCAVENGES = 4;

interface Props { state: GameState; }

export default function BuildingManager({ state }: Props) {
  const actions = useActions();
  const [defs, setDefs] = useState<Record<string, BuildingDef>>({});
  const [buildMsg, setBuildMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [scavengeMsg, setScavengeMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [dismantlePending, setDismantlePending] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config/buildings')
      .then(r => r.json())
      .then(setDefs)
      .catch(() => {});
  }, []);

  const canAfford = (def: BuildingDef): boolean =>
    def.cost.every(c => (state.resources[c.resource] ?? 0) >= c.amount);
  const completedTechs = new Set(
    state.research.filter(r => r.status === 'completed').map(r => r.techId)
  );
  const hasPrereqTech = (def: BuildingDef): boolean =>
    !def.prereqTech || completedTechs.has(def.prereqTech);

  const handleBuild = async (id: string) => {
    const res = await actions.build(id);
    if (res.ok) {
      const hasBuilders = state.crew.some(c => c.isAlive && c.assignedTask === 'task_build');
      setBuildMsg({
        text: hasBuilders
          ? `Construction started: ${id.replace(/_/g,' ')}`
          : `Construction started: ${id.replace(/_/g,' ')} — ⚠ Go to Crew and assign workers to Build task!`,
        ok: true,
      });
    } else {
      setBuildMsg({ text: `Cannot build: ${res.error}`, ok: false });
    }
    setTimeout(() => setBuildMsg(null), 6000);
  };

  const handleScavenge = async () => {
    const res = await actions.scavengeShip();
    if (res.ok) {
      const loot = Object.entries(res.gained as Record<string, number>)
        .map(([r, n]) => `+${n} ${r.replace(/_/g, ' ')}`)
        .join('  ');
      const remaining = res.remaining as number;
      setScavengeMsg({
        text: `Salvaged: ${loot}${remaining === 0 ? ' — Ship stripped!' : ` (${remaining} left)`}`,
        ok: true,
      });
    } else {
      setScavengeMsg({ text: res.error ?? 'Cannot scavenge', ok: false });
    }
    setTimeout(() => setScavengeMsg(null), 6000);
  };

  const buildable = Object.values(defs).filter(
    d => !STARTING_BUILDINGS.has(d.id) && d.buildTimeTicks > 0
  );
  const tiers = [...new Set(buildable.map(d => d.tier))].sort();

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {buildMsg && (
        <div className={`shrink-0 text-xs px-2 py-1 rounded ${buildMsg.ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {buildMsg.text}
        </div>
      )}

      {scavengeMsg && (
        <div className={`shrink-0 text-xs px-2 py-1 rounded ${scavengeMsg.ok ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'}`}>
          {scavengeMsg.text}
        </div>
      )}

      {/* Colony Buildings */}
      <div className="shrink-0">
        <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Colony Buildings</div>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {state.buildings.map(b => {
            const def = defs[b.type];
            // Mirror resourceEngine worker-counting logic
            const assignedWorkers = (() => {
              if (b.type === 'mine_basic')    return state.crew.filter(c => c.isAlive && c.assignedTask === 'task_mine_basic').length;
              if (b.type === 'mine_advanced') return state.crew.filter(c => c.isAlive && c.assignedTask === 'task_mine_adv').length;
              return state.crew.filter(c => c.isAlive && c.assignedBuildingId === b.id).length;
            })();
            return (
              <div key={b.id} className="bg-slate-800 rounded px-2 py-1.5 text-xs">
                {/* Top row: name + status + controls */}
                <div className="flex justify-between items-center">
                  <span className="text-white capitalize font-medium">{def?.name ?? b.type.replace(/_/g,' ')}</span>
                  <div className="flex gap-2 items-center">
                    {b.status === 'operational' && def && def.workers.max > 0 && (
                      <span className={assignedWorkers === 0 ? 'text-slate-500' : assignedWorkers < def.workers.min ? 'text-yellow-400' : 'text-slate-400'}>
                        👷 {assignedWorkers}/{def.workers.max}
                      </span>
                    )}
                    {b.type === 'radio_broken' ? (
                      <span className="text-red-400">broken</span>
                    ) : b.type === 'ship' ? (
                      <span className="text-red-400">crashed</span>
                    ) : (
                      <span className={
                        b.status === 'operational'  ? 'text-green-400' :
                        b.status === 'constructing' ? 'text-yellow-400' : 'text-red-400'
                      }>{b.status}</span>
                    )}
                    {b.status === 'operational' && b.type !== 'radio_broken' && b.type !== 'ship' && (
                      <button
                        onClick={() => actions.setPowered(b.id, !b.powered)}
                        className={`px-1 rounded text-xs ${b.powered ? 'bg-green-800 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                        {b.powered ? '⚡ON' : '⚡OFF'}
                      </button>
                    )}
                    {!STARTING_BUILDINGS.has(b.type) && dismantlePending !== b.id && (
                      <button
                        onClick={() => setDismantlePending(b.id)}
                        className="text-red-700 hover:text-red-400 px-1" title="Dismantle building">✕</button>
                    )}
                    {dismantlePending === b.id && (
                      <span className="flex items-center gap-1">
                        <span className="text-red-400 text-xs">Dismantle?</span>
                        <button
                          onClick={async () => {
                            const res = await actions.dismantle(b.id);
                            setDismantlePending(null);
                            if (res.refund && Object.keys(res.refund).length > 0) {
                              const summary = Object.entries(res.refund as Record<string,number>)
                                .map(([r,n]) => `+${n} ${r.replace(/_/g,' ')}`)
                                .join('  ');
                              setBuildMsg({ text: `Dismantled — recovered: ${summary}`, ok: true });
                              setTimeout(() => setBuildMsg(null), 6000);
                            }
                          }}
                          className="text-xs px-1.5 py-0.5 rounded bg-red-800 text-red-200 hover:bg-red-600">
                          Yes
                        </button>
                        <button
                          onClick={() => setDismantlePending(null)}
                          className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600">
                          No
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Construction progress block */}
                {b.status === 'constructing' && (() => {
                  const builders = state.crew.filter(
                    c => c.isAlive && c.assignedTask === 'task_build' && c.assignedBuildingId === b.id
                  ).length;
                  const progressPerTick = def && builders > 0
                    ? (100 / def.buildTimeTicks) * builders
                    : 0;
                  const ticksLeft = progressPerTick > 0
                    ? Math.ceil((100 - b.constructionProgress) / progressPerTick)
                    : null;
                  const hoursLeft = ticksLeft != null ? (ticksLeft / 30).toFixed(1) : null;

                  return (
                    <div className="mt-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-yellow-400 font-medium">🔨 {Math.round(b.constructionProgress)}%</span>
                        {builders > 0 ? (
                          <span className="text-slate-400">
                            👷 {builders} worker{builders > 1 ? 's' : ''}
                            {hoursLeft ? ` · ~${hoursLeft}h left` : ''}
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium">⚠ Stalled — assign builders!</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${builders > 0 ? 'bg-yellow-500' : 'bg-slate-600'}`}
                          style={{ width: `${Math.max(b.constructionProgress, 2)}%` }}
                        />
                      </div>
                      {builders === 0 && (
                        <div className="mt-1 text-red-400 text-xs">
                          Go to Crew tab → select this building → assign task "Build / Construct"
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Ship scavenge action */}
                {b.type === 'ship' && (() => {
                  const count = state.shipScavengeCount ?? 0;
                  const exhausted = count >= MAX_SHIP_SCAVENGES;
                  return (
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        onClick={handleScavenge}
                        disabled={exhausted}
                        className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                          exhausted
                            ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                            : 'border-amber-600 text-amber-300 hover:bg-amber-900 cursor-pointer'
                        }`}
                      >
                        🔧 Scavenge Ship
                      </button>
                      <span className="text-slate-500 text-xs">
                        {exhausted ? 'Nothing left to salvage' : `${MAX_SHIP_SCAVENGES - count} of ${MAX_SHIP_SCAVENGES} remaining`}
                      </span>
                    </div>
                  );
                })()}

                {/* Mine resource selector */}
                {(b.type === 'mine_basic' || b.type === 'mine_advanced') && b.status === 'operational' && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-slate-500">Mining:</span>
                    <select
                      value={b.miningResource ?? 'iron_ore'}
                      onChange={e => actions.setMineResource(b.id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs px-1 py-0.5"
                    >
                      {(b.type === 'mine_basic' ? MINE_BASIC_RESOURCES : MINE_ADV_RESOURCES).map(r => (
                        <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Build New */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Build New</div>

        {Object.keys(defs).length === 0 && (
          <div className="text-slate-500 text-xs">Loading…</div>
        )}

        {tiers.map(tier => {
          const tierInfo = TIER_LABEL[tier] ?? { label: `Tier ${tier}`, color: 'text-slate-400' };
          return (
            <div key={tier} className="mb-4">
              <div className={`text-xs font-bold mb-1 ${tierInfo.color}`}>{tierInfo.label}</div>
              <div className="space-y-1">
                {buildable.filter(d => d.tier === tier).map(def => {
                  const affordable = canAfford(def);
                  const unlocked = hasPrereqTech(def);
                  const canBuild = affordable && unlocked;
                  return (
                    <button
                      key={def.id}
                      onClick={() => { if (canBuild) handleBuild(def.id); }}
                      disabled={!canBuild}
                      className={`w-full text-left rounded border p-2 text-xs transition-colors ${
                        canBuild
                          ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-400 cursor-pointer'
                          : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`font-medium ${canBuild ? 'text-white' : 'text-slate-500'}`}>
                          {def.name}
                        </span>
                        <span className="text-slate-500 text-xs ml-2 whitespace-nowrap">
                          {def.buildTimeTicks > 0 ? `⏱ ${buildTime(def.buildTimeTicks)}` : ''}{' '}
                          👷 {def.workers.min === def.workers.max ? def.workers.min : `${def.workers.min}–${def.workers.max}`}
                        </span>
                      </div>

                      <div className="text-slate-400 mb-1.5">{def.description}</div>

                      {def.prereqTech && !unlocked && (
                        <div className="text-amber-300 mb-1">
                          Requires tech: {def.prereqTech.replace(/_/g,' ')}
                        </div>
                      )}

                      {def.cost.length > 0 ? (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {def.cost.map(c => {
                            const have = state.resources[c.resource] ?? 0;
                            const enough = have >= c.amount;
                            return (
                              <span key={c.resource} className={enough ? 'text-green-400' : 'text-red-400'}>
                                {getResourceIcon(c.resource)} {c.amount} {c.resource.replace(/_/g,' ')}
                                <span className="text-slate-500 ml-0.5">({formatNumber(have)})</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">No cost</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
