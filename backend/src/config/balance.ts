// ─── Core timing ──────────────────────────────────────────────────────────────
export const TICK_MS          = 2000;         // 2 seconds real-time per tick
export const TICKS_PER_HOUR   = 30;           // 30 ticks = 1 game-hour = 1 real-minute
export const TICKS_PER_DAY    = 720;          // 720 ticks = 1 game-day  = 24 real-minutes
export const DAY_TICKS        = 360;          // Day half (12 game-hours)
export const NIGHT_TICKS      = 360;          // Night half

// ─── Crew daily consumption (per game-day = 720 ticks) ───────────────────────
export const CREW_WATER_PER_DAY   = 2;        // 2L per crew per day
export const CREW_FOOD_PER_DAY    = 1;        // 1 ration per crew per day
export const CREW_OXYGEN_PER_DAY  = 1;        // 1 O₂ unit per crew per day

// Per-tick values (derived)
export const CREW_WATER_PER_TICK  = CREW_WATER_PER_DAY  / TICKS_PER_DAY;
export const CREW_FOOD_PER_TICK   = CREW_FOOD_PER_DAY   / TICKS_PER_DAY;
export const CREW_OXYGEN_PER_TICK = CREW_OXYGEN_PER_DAY / TICKS_PER_DAY;

// ─── Crew stats ───────────────────────────────────────────────────────────────
export const CREW_ENERGY_WORK_DRAIN   = 4 / TICKS_PER_DAY;  // full drain in ~25h
export const CREW_ENERGY_REST_REGEN   = 8 / TICKS_PER_DAY;  // full regen in ~12h rest
export const CREW_HUNGER_DRAIN        = 100 / (TICKS_PER_DAY * 2); // 50h to starve
export const CREW_THIRST_DRAIN        = 100 / TICKS_PER_DAY;       // 24h to dehydrate

// ─── Morale ───────────────────────────────────────────────────────────────────
export const MORALE_ADEQUATE_FOOD_BONUS    =  5 / TICKS_PER_DAY;
export const MORALE_ADEQUATE_WATER_BONUS   =  3 / TICKS_PER_DAY;
export const MORALE_RATION_50_PENALTY      = 15 / TICKS_PER_DAY;
export const MORALE_RATION_75_PENALTY      =  5 / TICKS_PER_DAY;
export const MORALE_RATION_125_BONUS       =  5 / TICKS_PER_DAY;
export const MORALE_CREW_DEATH_PENALTY     = 10;   // immediate flat hit to all
export const MORALE_MUTINY_THRESHOLD       = 25;
export const MORALE_GAME_OVER_THRESHOLD    =  0;

// ─── Research ─────────────────────────────────────────────────────────────────
export const BASE_RP_PER_TICK     = 2 / TICKS_PER_HOUR;   // 2 RP/h per scientist
export const SPEC_RP_PER_TICK     = 3 / TICKS_PER_HOUR;   // 3 RP/h with specialization

// ─── Task efficiency multipliers ─────────────────────────────────────────────
export const EFF_BASE             = 1.0;
export const EFF_SPECIALIZATION   = 1.5;
export const EFF_SECONDARY_SKILL  = 1.25;
export const EFF_TIRED            = 0.7;
export const EFF_EXHAUSTED        = 0.4;
export const EFF_SICK             = 0.5;
export const EFF_INJURED          = 0.3;
export const EFF_INSPIRED         = 1.25;

// ─── Starting state ───────────────────────────────────────────────────────────
export const STARTING_CREW_COUNT  = 12;
export const STARTING_RESOURCES = {
  water:    40,   // survival buffer
  oxygen:   20,
  food:     40,   // survival buffer
  energy:   20,
  iron_ore: 150,  // enough to build mine + smelt early steel
  coal:     40,   // enough to build smelter + first few smelt runs
  sand:     60,   // enough for several batches of concrete
  clay:     40,   // enough to build smelter (needs 25) + concrete (5/batch)
};

// ─── Difficulty multipliers ───────────────────────────────────────────────────
export const DIFFICULTY_MULTIPLIERS = {
  easy:      { resourceRate: 1.5, eventFreq: 0.5, crewResilience: 1.5 },
  normal:    { resourceRate: 1.0, eventFreq: 1.0, crewResilience: 1.0 },
  hard:      { resourceRate: 0.7, eventFreq: 1.5, crewResilience: 0.7 },
  nightmare: { resourceRate: 0.5, eventFreq: 2.0, crewResilience: 0.5 },
};

// ─── Storage ──────────────────────────────────────────────────────────────────
export const BASE_STORAGE_CAPACITY = 1000;
