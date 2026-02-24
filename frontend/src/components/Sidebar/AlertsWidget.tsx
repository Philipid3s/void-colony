import { GameState } from '../../types/gameTypes';

interface Props { state: GameState; }

export default function AlertsWidget({ state }: Props) {
  const alerts: { msg: string; color: string }[] = [];

  // Active events
  for (const evt of state.activeEvents.filter(e => !e.resolved)) {
    const color = evt.severity === 'high' || evt.severity === 'critical'
      ? 'text-red-400' : 'text-yellow-400';
    alerts.push({ msg: `⚠ ${evt.description.slice(0,50)}`, color });
  }

  // Mutiny warning
  if (state.globalMorale < 30) {
    alerts.push({ msg: `⚠ Low morale! Mutiny risk.`, color: 'text-red-400' });
  }

  // Resource shortage
  const critical = ['water','food','oxygen'];
  for (const res of critical) {
    const qty = state.resources[res] ?? 0;
    if (qty < 20) alerts.push({ msg: `⚠ Critical ${res} shortage!`, color: 'text-red-400' });
    else if (qty < 50) alerts.push({ msg: `! Low ${res}`, color: 'text-yellow-400' });
  }

  if (alerts.length === 0) return null;

  return (
    <div>
      <div className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">Alerts</div>
      <div className="space-y-0.5">
        {alerts.slice(0, 5).map((a, i) => (
          <div key={i} className={`text-xs ${a.color}`}>{a.msg}</div>
        ))}
      </div>
    </div>
  );
}
