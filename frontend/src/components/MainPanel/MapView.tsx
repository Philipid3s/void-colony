import { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types/gameTypes';
import { useActions } from '../../hooks/useActions';

interface Props { state: GameState; }

const TERRAIN: Record<string, { char: string; color: string }> = {
  plains:   { char: '·', color: 'text-green-700' },
  mountain: { char: '▲', color: 'text-slate-500' },
  crater:   { char: 'O', color: 'text-slate-600' },
  desert:   { char: '~', color: 'text-yellow-700' },
  ruins:    { char: 'R', color: 'text-purple-600' },
  cave:     { char: 'C', color: 'text-slate-400' },
  ice:      { char: '*', color: 'text-cyan-600' },
  forest:   { char: 'T', color: 'text-green-600' },
};

interface ContextMenu { screenX: number; screenY: number; tileX: number; tileY: number }

export default function MapView({ state }: Props) {
  const { map } = state;
  const actions = useActions();
  const mapRef = useRef<HTMLDivElement>(null);
  const centeredRef = useRef(false);
  const [ctx, setCtx] = useState<ContextMenu | null>(null);
  const [msg, setMsg] = useState('');

  // Center on colony (@) when map first loads
  useEffect(() => {
    if (centeredRef.current) return;
    if (!mapRef.current) return;
    const colonyTile = map.flat().find(t => t.structure === 'colony');
    if (!colonyTile) return;
    const TILE_PX = 18; // matches w-[18px] below
    const cx = colonyTile.x * TILE_PX;
    const cy = colonyTile.y * TILE_PX;
    const el = mapRef.current;
    el.scrollLeft = cx - el.clientWidth / 2 + TILE_PX / 2;
    el.scrollTop  = cy - el.clientHeight / 2 + TILE_PX / 2;
    centeredRef.current = true;
  }, [map]);

  const handleContextMenu = (e: React.MouseEvent, tileX: number, tileY: number) => {
    e.preventDefault();
    setCtx({ screenX: e.clientX, screenY: e.clientY, tileX, tileY });
  };

  const sendScouts = async () => {
    if (!ctx) return;
    setCtx(null);
    const res = await actions.scoutTile(ctx.tileX, ctx.tileY);
    if (res.ok) {
      setMsg(`${res.newTiles} new tile${res.newTiles !== 1 ? 's' : ''} revealed`);
    } else {
      setMsg(res.error ?? 'Scouting failed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const exploredCount = map.flat().filter(t => t.explored).length;
  const totalCount = map.flat().length;

  return (
    <div className="h-full flex flex-col" onClick={() => setCtx(null)}>
      <div className="flex justify-between items-center mb-2 shrink-0">
        <span className="text-xs text-slate-400">
          Explored: {exploredCount}/{totalCount} tiles
        </span>
        {msg && <span className="text-xs text-blue-300">{msg}</span>}
        <span className="text-xs text-slate-500">Right-click to send scouts</span>
      </div>

      <div
        ref={mapRef}
        className="font-mono leading-tight overflow-auto flex-1 bg-slate-900 rounded p-2 border border-slate-700 select-none"
      >
        {map.map((row, y) => (
          <div key={y} className="flex">
            {row.map((tile, x) => {
              if (!tile.explored) {
                return (
                  <span
                    key={x}
                    style={{ width: 18, textAlign: 'center', display: 'inline-block', fontSize: 13, cursor: 'context-menu' }}
                    className="text-slate-800"
                    onContextMenu={e => handleContextMenu(e, x, y)}
                  >█</span>
                );
              }
              if (tile.structure === 'colony') {
                return (
                  <span key={x} style={{ width: 18, textAlign: 'center', display: 'inline-block', fontSize: 13 }}
                    className="text-yellow-300 font-bold">@</span>
                );
              }
              const t = TERRAIN[tile.terrain] ?? { char: '?', color: 'text-gray-600' };
              return (
                <span
                  key={x}
                  style={{ width: 18, textAlign: 'center', display: 'inline-block', fontSize: 13, cursor: 'context-menu' }}
                  className={`${t.color} ${tile.resourceDeposit ? 'underline' : ''}`}
                  onContextMenu={e => handleContextMenu(e, x, y)}
                  title={tile.resourceDeposit ? `Deposit: ${tile.resourceDeposit}` : undefined}
                >
                  {t.char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-600 mt-1 shrink-0">
        @ Colony  · Plains  ▲ Mountain  O Crater  ~ Desert  R Ruins  C Cave  * Ice  T Forest
        {' '}· <span className="underline">underline</span> = resource deposit
      </div>

      {/* Right-click context menu */}
      {ctx && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded shadow-lg py-1"
          style={{ left: ctx.screenX, top: ctx.screenY }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-slate-400 border-b border-slate-700">
            Tile ({ctx.tileX}, {ctx.tileY})
          </div>
          <button
            className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
            onClick={sendScouts}
          >
            🗺 Send Scout Party
          </button>
        </div>
      )}
    </div>
  );
}
