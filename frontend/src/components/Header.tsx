import { GameState } from '../types/gameTypes';
import { formatNumber, getAliveCount } from '../utils/formatters';

interface Props {
  state: GameState;
  connected: boolean;
}

export default function Header({ state, connected }: Props) {
  const { day, hour, minute } = (() => {
    const TICKS_PER_HOUR = 30;
    const TICKS_PER_DAY  = 720;
    return {
      day:    Math.floor(state.tick / TICKS_PER_DAY) + 1,
      hour:   Math.floor((state.tick % TICKS_PER_DAY) / TICKS_PER_HOUR),
      minute: Math.floor(((state.tick % TICKS_PER_HOUR) / TICKS_PER_HOUR) * 60),
    };
  })();

  const timeStr = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h1 className="text-blue-400 font-bold text-lg tracking-wider">VOID COLONY</h1>
        <span className="text-slate-400 text-sm">
          {state.isDay ? '☀' : '🌙'} Day {day} | {timeStr}
        </span>
        <span className="text-yellow-400 text-sm">
          ⚡ {formatNumber(state.resources['energy'] ?? 0)} kWh
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-400">
          👥 {getAliveCount(state)} crew
        </span>
        <span className={`text-sm ${state.globalMorale > 50 ? 'text-green-400' : state.globalMorale > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
          😊 Morale {Math.round(state.globalMorale)}%
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${connected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {connected ? '● LIVE' : '● OFFLINE'}
        </span>
        <span className="text-slate-500 text-xs">
          {state.difficulty.toUpperCase()}
        </span>
      </div>
    </header>
  );
}
