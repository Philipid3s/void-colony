import { GameState } from '../../types/gameTypes';
import { useActions } from '../../hooks/useActions';

interface Props { state: GameState; }

const TECH_LABELS: Record<string, string> = {
  basic_infrastructure: 'Basic Infrastructure',
  water_systems: 'Water Systems',
  advanced_water_recycling: 'Adv. Water Recycling',
  energy_systems: 'Energy Systems',
  nuclear_energy: 'Nuclear Energy',
  fusion_energy: 'Fusion Energy',
  advanced_energy_storage: 'Energy Storage',
  deep_construction: 'Deep Construction',
  planetary_science: 'Planetary Science',
  mining_technology: 'Mining Technology',
  metallurgy: 'Metallurgy',
  advanced_alloys: 'Advanced Alloys',
  deep_drilling: 'Deep Drilling',
  alien_studies: 'Alien Studies',
  agriculture: 'Agriculture',
  advanced_agriculture: 'Adv. Agriculture',
  genetic_modification: 'Genetic Modification',
  sustainability: 'Sustainability',
  chemistry: 'Chemistry',
  medicine: 'Medicine',
  advanced_medicine: 'Adv. Medicine',
  manufacturing: 'Manufacturing',
  advanced_manufacturing: 'Adv. Manufacturing',
  electronics: 'Electronics',
  communications: 'Communications',
  advanced_communications: 'Adv. Communications',
  robotics: 'Robotics',
  defense_systems: 'Defense Systems',
  vehicles: 'Vehicles',
  exploration: 'Exploration',
  aerospace: 'Aerospace',
  beacon_technology: 'Beacon Technology',
  astronomy: 'Astronomy',
  signal_analysis: 'Signal Analysis',
};

export default function ResearchTree({ state }: Props) {
  const actions = useActions();

  const current = state.research.find(r => r.techId === state.activeResearchId);

  const handleResearch = async (techId: string) => {
    const res = await actions.research(techId);
    if (!res.ok) alert(`Cannot research: ${res.error}`);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':  return 'bg-green-900 border-green-600 text-green-300';
      case 'researching':return 'bg-blue-900 border-blue-500 text-blue-200';
      case 'available':  return 'bg-slate-800 border-slate-500 text-white hover:bg-slate-700 cursor-pointer';
      default:           return 'bg-slate-900 border-slate-700 text-slate-600';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Active research */}
      {current && (
        <div className="mb-3 p-2 bg-blue-900 rounded border border-blue-600 text-xs">
          <div className="text-blue-300 font-bold">Researching: {TECH_LABELS[current.techId] ?? current.techId}</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${current.progress}%` }} />
          </div>
          <div className="text-slate-400 mt-0.5">{Math.round(current.progress)}% — assign Scientists to Research Lab</div>
        </div>
      )}

      {/* RP count */}
      <div className="text-xs text-slate-400 mb-2">Total RP earned: {Math.round(state.researchPoints)}</div>

      {/* Tech list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {state.research.map(entry => (
          <div
            key={entry.techId}
            className={`rounded border px-2 py-1.5 text-xs transition-colors ${statusColor(entry.status)}`}
            onClick={() => entry.status === 'available' && handleResearch(entry.techId)}
          >
            <div className="flex justify-between items-center">
              <span>{TECH_LABELS[entry.techId] ?? entry.techId}</span>
              <span className="text-slate-400 text-xs ml-2">
                {entry.status === 'completed' ? '✓' :
                 entry.status === 'researching' ? `${Math.round(entry.progress)}%` :
                 entry.status === 'available' ? 'Click to research' : '🔒'}
              </span>
            </div>
            {entry.status === 'researching' && (
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${entry.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
