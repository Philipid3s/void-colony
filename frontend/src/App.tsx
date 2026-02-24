import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useActions } from './hooks/useActions';
import Header from './components/Header';
import ResourcePanel from './components/Sidebar/ResourcePanel';
import CrewSummary from './components/Sidebar/CrewSummary';
import AlertsWidget from './components/Sidebar/AlertsWidget';
import CrewManager from './components/MainPanel/CrewManager';
import BuildingManager from './components/MainPanel/BuildingManager';
import ResearchTree from './components/MainPanel/ResearchTree';
import QuestLog from './components/MainPanel/QuestLog';
import MapView from './components/MainPanel/MapView';
import CraftingPanel from './components/MainPanel/CraftingPanel';
import EventLog from './components/EventLog';
import { Difficulty } from './types/gameTypes';

type Tab = 'crew' | 'buildings' | 'crafting' | 'research' | 'quests' | 'map';
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'crew',      label: 'Crew',       emoji: '👥' },
  { id: 'buildings', label: 'Buildings',  emoji: '🏗' },
  { id: 'crafting',  label: 'Crafting',   emoji: '⚗' },
  { id: 'research',  label: 'Research',   emoji: '🔬' },
  { id: 'quests',    label: 'Quests',     emoji: '📜' },
  { id: 'map',       label: 'Map',        emoji: '🗺' },
];

export default function App() {
  const { state, connected } = useGameState();
  const actions = useActions();
  const [tab, setTab] = useState<Tab>('crew');

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <h1 className="text-3xl font-bold text-blue-400 mb-6 tracking-wider">VOID COLONY</h1>
        <p className="text-slate-400 mb-8">Space Outpost Management — 50 survivors. One mission.</p>
        <div className="flex flex-col gap-3">
          {(['easy','normal','hard','nightmare'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => actions.newGame(d)}
              className="px-8 py-3 rounded border border-blue-600 bg-blue-900 hover:bg-blue-700 text-white capitalize font-bold tracking-wider">
              New Game — {d.toUpperCase()}
            </button>
          ))}
        </div>
        <p className={`mt-6 text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
          Server: {connected ? 'Connected' : 'Connecting...'}
        </p>
      </div>
    );
  }

  if (state.status === 'lost') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <h1 className="text-3xl font-bold text-red-500 mb-4">COLONY LOST</h1>
        <p className="text-slate-400 mb-2">Day {Math.floor(state.tick / 720) + 1}</p>
        <p className="text-slate-400 mb-8">The colony has fallen.</p>
        <button onClick={() => actions.newGame('normal')}
          className="px-6 py-2 rounded border border-slate-600 hover:bg-slate-800">
          Try Again
        </button>
      </div>
    );
  }

  if (state.status === 'won') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <h1 className="text-3xl font-bold text-green-400 mb-4">MISSION COMPLETE</h1>
        <p className="text-slate-300 mb-8">The colony has been saved after {Math.floor(state.tick / 720) + 1} days!</p>
        <button onClick={() => actions.newGame('normal')}
          className="px-6 py-2 rounded border border-green-600 hover:bg-green-900">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header state={state} connected={connected} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto p-3 space-y-4 text-sm shrink-0">
          <AlertsWidget state={state} />
          <ResourcePanel state={state} />
          <CrewSummary state={state} />

          {/* Ration control */}
          <div>
            <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Rations</div>
            <div className="flex flex-wrap gap-1">
              {([50, 75, 100, 125] as const).map(level => (
                <button key={level} onClick={() => actions.setRations(level)}
                  className={`text-xs px-1.5 py-0.5 rounded border ${state.rationLevel === level ? 'bg-blue-800 border-blue-500 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}>
                  {level}%
                </button>
              ))}
            </div>
          </div>

          {/* Game control */}
          <div className="flex flex-col gap-1">
            <button onClick={() => actions.saveGame()}
              className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-400 hover:bg-slate-800">
              💾 Save
            </button>
            <button onClick={() => actions.newGame(state.difficulty)}
              className="text-xs px-2 py-1 rounded border border-red-800 text-red-400 hover:bg-red-950">
              ↩ Restart
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-700 bg-slate-900">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${tab === t.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden p-3">
            {tab === 'crew'      && <CrewManager      state={state} />}
            {tab === 'buildings' && <BuildingManager  state={state} />}
            {tab === 'crafting'  && <CraftingPanel    state={state} />}
            {tab === 'research'  && <ResearchTree     state={state} />}
            {tab === 'quests'    && <QuestLog         state={state} />}
            {tab === 'map'       && <MapView          state={state} />}
          </div>

          {/* Event log at bottom */}
          <EventLog state={state} />
        </main>
      </div>
    </div>
  );
}
