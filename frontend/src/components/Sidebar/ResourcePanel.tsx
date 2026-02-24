import { GameState } from '../../types/gameTypes';
import { formatNumber, getResourceIcon, getNetRate } from '../../utils/formatters';

const CRITICAL_RESOURCES = ['water', 'oxygen', 'food', 'energy'];
const COMMON_RESOURCES = [
  // Raw — mineable
  'iron_ore', 'copper', 'aluminium', 'nickel', 'lithium', 'titanium',
  'silicon', 'coal', 'sulfur', 'sand', 'clay',
  // Processed
  'steel', 'concrete', 'glass', 'plastic', 'electronics',
  'battery_cells', 'fuel_cells', 'wiring', 'alloy_plates', 'carbon_fiber',
  'fertilizer', 'medicine', 'biomass',
];

interface Props { state: GameState; }

function ResourceRow({ id, state }: { id: string; state: GameState }) {
  const qty = state.resources[id] ?? 0;
  const net = getNetRate(state, id);
  const netColor = net > 0.001 ? 'text-green-400' : net < -0.001 ? 'text-red-400' : 'text-slate-500';
  const netStr = net === 0 ? '' : `${net > 0 ? '+' : ''}${formatNumber(net * 30)}/h`;

  return (
    <div className="flex justify-between items-center py-0.5 text-xs">
      <span className="text-slate-300">{getResourceIcon(id)} {id.replace(/_/g,' ')}</span>
      <span className="flex gap-2">
        <span className="text-white">{formatNumber(qty)}</span>
        {netStr && <span className={netColor}>{netStr}</span>}
      </span>
    </div>
  );
}

export default function ResourcePanel({ state }: Props) {
  const hasResource = (id: string) => (state.resources[id] ?? 0) > 0;

  return (
    <div className="space-y-3">
      {/* Critical */}
      <div>
        <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Life Support</div>
        {CRITICAL_RESOURCES.map(id => <ResourceRow key={id} id={id} state={state} />)}
      </div>

      {/* Storage bar */}
      <div>
        <div className="text-xs text-slate-500 mb-1">
          Storage: {formatNumber(Object.values(state.resources).reduce((a,b)=>a+b,0))} / {state.storageCapacity}
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1">
          <div
            className="bg-blue-600 h-1 rounded-full"
            style={{ width: `${Math.min(100, (Object.values(state.resources).reduce((a,b)=>a+b,0) / state.storageCapacity) * 100)}%` }}
          />
        </div>
      </div>

      {/* Materials */}
      <div>
        <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Materials</div>
        {COMMON_RESOURCES.filter(hasResource).map(id => <ResourceRow key={id} id={id} state={state} />)}
      </div>

      {/* Special */}
      {['alien_crystal','ancient_artifact','helium3','rare_earth'].some(hasResource) && (
        <div>
          <div className="text-xs text-purple-400 font-bold mb-1 uppercase tracking-wider">Special</div>
          {['alien_crystal','ancient_artifact','helium3','rare_earth'].filter(hasResource).map(id =>
            <ResourceRow key={id} id={id} state={state} />
          )}
        </div>
      )}
    </div>
  );
}
