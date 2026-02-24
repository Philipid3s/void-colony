import { GameState } from '../types/gameTypes';
import { getEventColor, formatTime } from '../utils/formatters';

interface Props { state: GameState; }

export default function EventLog({ state }: Props) {
  return (
    <div className="h-32 overflow-y-auto bg-slate-900 border-t border-slate-700 px-3 py-2">
      <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Event Log</div>
      {state.eventLog.slice(0, 50).map(entry => (
        <div key={entry.id} className={`text-xs ${getEventColor(entry.type)} leading-relaxed`}>
          <span className="text-slate-600 mr-2">[{formatTime(entry.tick)}]</span>
          {entry.message}
        </div>
      ))}
    </div>
  );
}
