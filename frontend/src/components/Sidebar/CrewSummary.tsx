import { GameState } from '../../types/gameTypes';
import { getAliveCount, getSickCount, getIdleCount } from '../../utils/formatters';

interface Props { state: GameState; }

export default function CrewSummary({ state }: Props) {
  const alive  = getAliveCount(state);
  const sick   = getSickCount(state);
  const idle   = getIdleCount(state);
  const active = alive - idle;

  const specCounts: Record<string, number> = {};
  for (const c of state.crew.filter(c => c.isAlive)) {
    specCounts[c.specialization] = (specCounts[c.specialization] ?? 0) + 1;
  }

  return (
    <div>
      <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Crew</div>

      <div className="grid grid-cols-2 gap-1 text-xs mb-2">
        <div className="text-green-400">👥 Alive: {alive}</div>
        <div className="text-yellow-400">⚙ Active: {active}</div>
        <div className="text-red-400">🤒 Sick/Inj: {sick}</div>
        <div className="text-slate-400">💤 Idle: {idle}</div>
      </div>

      <div className="space-y-0.5">
        {Object.entries(specCounts).map(([spec, count]) => (
          <div key={spec} className="flex justify-between text-xs text-slate-400">
            <span className="capitalize">{spec}</span>
            <span className="text-slate-300">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
