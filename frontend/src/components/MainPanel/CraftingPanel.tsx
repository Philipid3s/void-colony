import { useEffect, useState } from 'react';
import { GameState } from '../../types/gameTypes';
import { formatNumber } from '../../utils/formatters';

interface Recipe {
  id: string;
  name: string;
  buildingTypes: string[];
  inputs: { resource: string; amount: number }[];
  outputs: { resource: string; amount: number }[];
  timeTicks: number;
  workersNeeded: number;
}

interface BuildingDef { id: string; name: string; }

interface Props { state: GameState; }

export default function CraftingPanel({ state }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [buildingDefs, setBuildingDefs] = useState<Record<string, BuildingDef>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/config/recipes').then(r => r.json()).then(setRecipes).catch(() => {});
    fetch('/api/config/buildings').then(r => r.json()).then(setBuildingDefs).catch(() => {});
  }, []);

  // Returns first operational building compatible with a recipe, or null
  const findBuilding = (recipe: Recipe) =>
    state.buildings.find(b => b.status === 'operational' && recipe.buildingTypes.includes(b.type)) ?? null;

  const canAfford = (recipe: Recipe) =>
    recipe.inputs.every(i => (state.resources[i.resource] ?? 0) >= i.amount);

  const craft = async (recipe: Recipe) => {
    const building = findBuilding(recipe);
    if (!building) {
      const needed = recipe.buildingTypes
        .map(t => buildingDefs[t]?.name ?? t.replace(/_/g, ' '))
        .join(' or ');
      setMsg(`Need an operational ${needed}`);
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    const res = await fetch('/api/action/craft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: recipe.id, buildingId: building.id }),
    });
    const data = await res.json();
    setMsg(data.ok ? 'Crafting started!' : `Error: ${data.error}`);
    setTimeout(() => setMsg(''), 3000);
  };

  const activeJobs = state.craftingJobs?.filter(j => !j.completed) ?? [];
  const hoursLeft = (endTick: number) => ((endTick - state.tick) / 30).toFixed(1);

  return (
    <div className="h-full flex flex-col">
      {msg && <div className="mb-2 text-xs px-2 py-1 rounded bg-blue-900 text-blue-200">{msg}</div>}

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-yellow-400 font-bold mb-1 uppercase tracking-wider">Active Jobs</div>
          {activeJobs.map(job => {
            const recipe = recipes.find(r => r.id === job.recipeId);
            const progress = Math.min(100, ((state.tick - job.startTick) / (job.endTick - job.startTick)) * 100);
            return (
              <div key={job.id} className="bg-slate-800 rounded p-2 mb-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white">{recipe?.name ?? job.recipeId}</span>
                  <span className="text-slate-400">{hoursLeft(job.endTick)}h left</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Recipes</div>
        {recipes.map(recipe => {
          const affordable = canAfford(recipe);
          const building = findBuilding(recipe);
          const hasBuilding = !!building;
          const canCraft = affordable && hasBuilding;
          const buildingLabel = recipe.buildingTypes
            .map(t => buildingDefs[t]?.name ?? t.replace(/_/g, ' '))
            .join(' / ');
          return (
            <div key={recipe.id}
              className={`rounded border p-2 text-xs ${canCraft ? 'border-slate-600 bg-slate-800' : 'border-slate-700 bg-slate-900 opacity-60'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`font-medium ${canCraft ? 'text-white' : 'text-slate-400'}`}>{recipe.name}</span>
                <button onClick={() => craft(recipe)} disabled={!canCraft}
                  className={`px-2 py-0.5 rounded text-xs ml-2 ${canCraft ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                  Craft
                </button>
              </div>
              <div className={`text-xs mb-1 ${hasBuilding ? 'text-green-400' : 'text-red-400'}`}>
                🏭 {buildingLabel}{!hasBuilding ? ' — not built' : ''}
              </div>
              <div className="text-slate-500 text-xs mb-0.5">
                ⏱ {(recipe.timeTicks / 30).toFixed(1)}h · 👷 {recipe.workersNeeded} worker(s)
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="text-red-400">
                  In: {recipe.inputs.map(i =>
                    `${i.amount} ${i.resource.replace(/_/g, ' ')} (${formatNumber(state.resources[i.resource] ?? 0)})`
                  ).join(', ')}
                </span>
              </div>
              <div className="text-green-400 text-xs mt-0.5">
                Out: {recipe.outputs.map(o => `${o.amount} ${o.resource.replace(/_/g, ' ')}`).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
