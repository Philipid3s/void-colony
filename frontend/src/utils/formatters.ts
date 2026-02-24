import { GameState } from '../types/gameTypes';

export function formatTick(tick: number): { day: number; hour: number; minute: number } {
  const TICKS_PER_HOUR = 30;
  const TICKS_PER_DAY  = 720;
  const day  = Math.floor(tick / TICKS_PER_DAY) + 1;
  const hour = Math.floor((tick % TICKS_PER_DAY) / TICKS_PER_HOUR);
  const minute = Math.floor(((tick % TICKS_PER_HOUR) / TICKS_PER_HOUR) * 60);
  return { day, hour, minute };
}

export function formatTime(tick: number): string {
  const { day, hour, minute } = formatTick(tick);
  return `Day ${day} — ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}

export function formatNumber(n: number, decimals = 1): string {
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return n % 1 === 0 ? String(Math.floor(n)) : n.toFixed(decimals);
}

export function formatRate(perTick: number): string {
  const perHour = perTick * 30;
  if (Math.abs(perHour) < 0.01) return '~0/h';
  return `${perHour >= 0 ? '+' : ''}${formatNumber(perHour)}/h`;
}

export function getResourceIcon(id: string): string {
  const icons: Record<string, string> = {
    water: '💧', oxygen: '🫁', food: '🍖', energy: '⚡',
    iron_ore: '⛏', copper: '🔶', aluminium: '🔷', nickel: '⚙', lithium: '🔋',
    titanium: '🛡', uranium: '☢', silicon: '💠', gold: '🥇', platinum: '💎',
    rare_earth: '🌐', coal: '🪨', oil: '🛢', nat_gas: '💨', sulfur: '🟡',
    sand: '🏜', clay: '🧱', ice: '🧊', steel: '⚙', concrete: '🏗',
    glass: '🪟', plastic: '🧴', electronics: '📡', biomass: '🌿',
    alien_crystal: '🔮', ancient_artifact: '🏺', hydrogen: '⚗', helium3: '✨',
    medicine: '💊', fertilizer: '🌱', wiring: '🔌', rocket_fuel: '🚀',
  };
  return icons[id] ?? '📦';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':   return 'text-green-400';
    case 'tired':     return 'text-yellow-400';
    case 'exhausted': return 'text-orange-400';
    case 'hungry':    return 'text-yellow-500';
    case 'starving':  return 'text-red-400';
    case 'dehydrated':return 'text-red-500';
    case 'sick':      return 'text-purple-400';
    case 'injured':   return 'text-red-400';
    case 'depressed': return 'text-blue-400';
    case 'inspired':  return 'text-cyan-300';
    default:          return 'text-gray-400';
  }
}

export function getEventColor(type: string): string {
  switch (type) {
    case 'danger':  return 'text-red-400';
    case 'warning': return 'text-yellow-400';
    case 'success': return 'text-green-400';
    case 'event':   return 'text-cyan-400';
    default:        return 'text-gray-300';
  }
}

export function getAliveCount(state: GameState): number {
  return state.crew.filter(c => c.isAlive).length;
}

export function getSickCount(state: GameState): number {
  return state.crew.filter(c => c.isAlive && (c.status === 'sick' || c.status === 'injured')).length;
}

export function getIdleCount(state: GameState): number {
  return state.crew.filter(c => c.isAlive && !c.assignedTask).length;
}

export function getNetRate(state: GameState, resourceId: string): number {
  const prod = state.resourceProduction[resourceId] ?? 0;
  const cons = state.resourceConsumption[resourceId] ?? 0;
  return prod - cons;
}
