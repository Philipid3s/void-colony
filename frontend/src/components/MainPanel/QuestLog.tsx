import { GameState, QuestEntry } from '../../types/gameTypes';

interface Props { state: GameState; }

function QuestCard({ quest }: { quest: QuestEntry }) {
  const statusColor = {
    active: 'border-yellow-600 bg-yellow-950',
    completed: 'border-green-700 bg-green-950',
    available: 'border-blue-700 bg-blue-950',
    locked: 'border-slate-700 bg-slate-900 opacity-50',
    failed: 'border-red-700 bg-red-950',
  }[quest.status] ?? 'border-slate-700 bg-slate-800';

  return (
    <div className={`rounded border p-2 text-xs mb-2 ${statusColor}`}>
      <div className="flex justify-between mb-1">
        <span className="text-white font-bold">{quest.title}</span>
        <span className="text-slate-400 capitalize">{quest.status} · Ch.{quest.chapter}</span>
      </div>
      <div className="text-slate-400 mb-1">{quest.description}</div>
      {quest.objectives.map(obj => (
        <div key={obj.id} className="flex items-center gap-1">
          <span className={obj.completed ? 'text-green-400' : 'text-slate-400'}>
            {obj.completed ? '✓' : '○'}
          </span>
          <span className={obj.completed ? 'text-green-300 line-through opacity-60' : 'text-slate-300'}>
            {obj.description}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function QuestLog({ state }: Props) {
  const active    = state.quests.filter(q => q.status === 'active');
  const available = state.quests.filter(q => q.status === 'available');
  const completed = state.quests.filter(q => q.status === 'completed');

  return (
    <div className="h-full overflow-y-auto">
      {active.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-yellow-400 font-bold mb-1 uppercase tracking-wider">Active Quests</div>
          {active.map(q => <QuestCard key={q.questId} quest={q} />)}
        </div>
      )}
      {available.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Available</div>
          {available.map(q => <QuestCard key={q.questId} quest={q} />)}
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <div className="text-xs text-green-400 font-bold mb-1 uppercase tracking-wider">Completed ({completed.length})</div>
          {completed.map(q => <QuestCard key={q.questId} quest={q} />)}
        </div>
      )}
    </div>
  );
}
